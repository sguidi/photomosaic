(function () {
    "use strict";

    // Application possible statuses
    var STATUS_INITIAL = 'initial';
    var STATUS_PROCESSING = 'processing';
    var STATUS_INCOMPATIBLE = 'incompatible';
    var STATUS_ERROR = 'error';

    // Current status
    var status;

    function imageToMosaic(file) {
        setStatus(STATUS_PROCESSING);
        Utils.loadImage(file).then(function (image) {
            transform(image);
        }).catch(function (e) {
            setStatus(STATUS_ERROR);
        });
    }

    // Transfor the image to mosaic
    function transform(image) {
        var start = performance.now();

        //Create canvas result and append it to the DOM
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        document.getElementById('mosaic').appendChild(canvas);

        // Transform the image and append orderd rows as soon as they're ready
        var buildRowsPromise = MosaicBuilder.transformRowByRow(image, TILE_WIDTH, TILE_HEIGHT,
            function (row) {
                // canvas.height = row[0].height * (row[0].r + 1);
                row.forEach(function (cell) {
                    // var tile = new Image();
                    // tile.src = cell.tile;
                    if (cell.tile.complete) {
                        // document.getElementById('mosaic').appendChild(cell.tile);
                        context.drawImage(cell.tile, cell.x, cell.y, cell.width, cell.height);
                    }
                });
                //
            }
        );

        buildRowsPromise.then(function () {
            console.log('mosaic completed in', ((performance.now() - start) / 1000).toFixed(3), 'sec');
            setStatus(STATUS_INITIAL);
        }).catch(function (err) {
            // catch any error that happened along the way
            setStatus(STATUS_ERROR);
        });
    }

    // Update application status and application behave
    function setStatus(value) {
        status = value;
        document.querySelector('#status').className = status;
        document.getElementById('file-input').disabled = ([STATUS_PROCESSING, STATUS_INCOMPATIBLE].indexOf(status) >= 0);
    }

    // Initialize the application
    function init() {

        // browser compatibility checks
        if (!Utils.isCanvasSupported()) {
            setStatus(STATUS_INCOMPATIBLE);
            return;
        }
        // Avoid drag by mistake outside the drop-zone
        window.addEventListener("dragover", function (e) {
            e = e || event;
            e.preventDefault();
        }, false);
        window.addEventListener("drop", function (e) {
            e = e || event;
            e.preventDefault();
        }, false);

        // drag & drop handler
        var dropZoneEl = document.getElementById('drop-zone');

        dropZoneEl.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (status != STATUS_INITIAL) {
                return false;
            }
            dropZoneEl.classList.add('dragging');
        }, true);

        dropZoneEl.addEventListener('dragleave', function (e) {
            e.preventDefault();
            dropZoneEl.classList.remove('dragging');
        }, true);

        dropZoneEl.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZoneEl.classList.remove('dragging');
            imageToMosaic(e.dataTransfer.files[0]);
        }, true);

        // file input handler
        var fileInput = document.getElementById('file-input');

        fileInput.addEventListener('change', function (e) {
            e.preventDefault();
            if (status != STATUS_INITIAL) {
                return false;
            }
            imageToMosaic(e.target.files[0]);
        });

        // Ready to go
        setStatus(STATUS_INITIAL);
    }

    // React to document ready
    document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
            init();
        }
    };
})();