/**
 * Transform an Image into an equivaled tiles based mosaic
 * The transformation process is implemented as async multi-threads parallelism
 * This architecture design improve performance and avoid the execution to block the UI 
 */
var MosaicBuilder = (function () {
    'use strict';

    // Quantity of multi-threads available for the transformation
    var WORKERS_POOL_SIZE = 4;

    // The internal mosaic builder executing the transformation
    var builder;

    /**
     * Transform the image into tiles, the operation is done row by row with guarantee of rows order
     * The function accept an optional callback to allow to operate on each row result while execution is still in progress
     * The function return a Promise that resolve when transformation is completed
     * @param {Image} image - The image to transform
     * @param {number} tileW - The tile width size
     * @param {number} tileH - The tile heigth size
     * @param {Function} callback - The callback to allow in progress work on single rows result
     * @returns {Promise} - To react to the async process success/failure 
     */
    function transformRowByRow(image, tileW, tileH, callback) {
        // Guard transformation already in progress
        if (!builder) {
            // Slice the image in tiles, a matrix of cells with structure of [row[cell]]
            var slices = Utils.sliceImage(image, tileW, tileH);

            console.log('Image sliced in', slices.length, 'rows');
            // Internal class to build the mosaic
            builder = new MosaicBuilder();
            // Configure the promise
            return builder.compute(slices, callback, function(){
                // delete the builder on work done
                builder = null;
            });
        }
    }

    /**
     * Interrupt in progress transformation
    */
    function cancel() {
        if(builder) {
            // Stop current transformation
            builder.cancel();
            builder = null;
        }
    }

    /**
     * Use the workers pool to retrieve for each row of cells their average hex color tile
     */
    function MosaicBuilder() {

        var pool = new ThreadPool.Pool('js/worker.js', WORKERS_POOL_SIZE);

        var running = false;

        /**
         * Set up parallel compute of each row, execute callback for WIP results and return process associated Promise
         * @param {Array} rows - matrix of rows of image cells to be computed with associated tiles
         * @param {Function} callback - on row completition callback function to be executed
         * @returns {Promise} - To react to the async process success/failure
         */
        function compute(rows, callback, onComplete) {
            // Init the pool
            pool.init();

            running = true;
            // Keep count of completed tasks in order to clean the pool on job done
            var computed = 0;

            // Map rows to computeRow promises and create a sequence of them.
            // This will ensure parallel executtion and ordered completition.
            return rows.map(computeRow).reduce(function (sequence, rowPromise) {
                // Use reduce to chain the promises together
                return sequence.then(function () {
                    // Wait for everything in the sequence so far
                    return rowPromise;
                }).then(function (row) {
                    if(!running) {
                        throw 'Render interrupted!';
                    }
                    // Increment internal counter to keep track of progress
                    computed++;
                    if (computed === rows.length) {
                        // Last promise completed, clean up the pool and notify end of execution
                        pool.destroy();
                        onComplete();
                    }
                    if (callback) {
                        // A callback to react to the row result is defined, execute it
                        callback(row);
                    }
                });
            }, Promise.resolve());
        }

        /** Cancel current computation */
        function cancel() {
            running = false;
            pool.destroy();
        }

        /** Async compute cells tiles
         * @param {Array} cells - image cells
         * @param {Promise} - To react to the async process success/failure
         */
        function computeRow(cells) {
            return new Promise(function (resolve, reject) {
                // Run the cells compute via the pool
                pool.run(cells, function (e) {
                    resolve(e.data);
                });
            });
        }

        return {
            compute: compute,
            cancel: cancel
        };
    }

    return {
        transformRowByRow: transformRowByRow,
        cancel: cancel
    };

})();

var exports = exports || null;
if (exports) {
    exports.MosaicBuilder = MosaicBuilder;
}