var MosaicBuilder = (function () {
    'use strict';

    var WORKERS_POOL_SIZE = 16;

    function transformRowByRow(image, tileW, tileH, callback) {
        var slices = Utils.sliceImage(image, tileW, tileH);

        console.log('buildByRow', slices.length);
        // Internal class to build the mosaic
        var builder = new MosaicBuilder();
        // Return a sequence of promises ordered by slices rows
        // Each promise via Web Worker load the hex tile into each slice and resolve it via callback
        return builder.build(slices, callback);
    }

    function MosaicBuilder() {

        var pool = new WorkerPool.Pool('js/worker.js', WORKERS_POOL_SIZE);

        function build(rows, callback) {
            // Init the pool
            pool.init();
            // Keep count of completed to clean the pool on job done
            var computed = 0;

            // Map our array of chapter urls to
            // an array of chapter json promises.
            // This makes sure they all download parallel.
            return rows.map(computeRow).reduce(function (sequence, rowPromise) {
                // Use reduce to chain the promises together,
                // adding content to the page for each chapter
                return sequence.then(function () {
                    // Wait for everything in the sequence so far,
                    // then wait for this chapter to arrive.
                    return rowPromise;
                }).then(function (row) {
                    computed++;
                    if (computed === rows.length) {
                        pool.destroy();
                    }
                    callback(row);
                });
            }, Promise.resolve());
        }

        function computeRow(row) {
            return new Promise(function (resolve, reject) {
                pool.run(row, function (e) {
                    var result = e.data;
                    var loads = [];
                    result.forEach(function (cell) {
                        loads.push(Utils.loadTile(cell.hex));
                    });
                    Promise.all(loads).then(function (tileImages) {
                        for (var i = 0; i < tileImages.length; i++) {
                            result[i].tile = tileImages[i];
                        }
                        resolve(result);
                    });
                });
            });
        }


        return {
            build: build
        };
    }

    return {
        transformRowByRow: transformRowByRow
    };

})();

var exports = exports || null;
if (exports) {
    exports.MosaicBuilder = MosaicBuilder;
}