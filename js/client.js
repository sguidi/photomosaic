(function () {
    "use strict";

    // Application possible statuses
    var STATUS_INITIAL = 'initial';
    var STATUS_PROCESSING = 'processing';
    var STATUS_INCOMPATIBLE = 'incompatible';
    var STATUS_ERROR = 'error';

    // Current status
    var status;

    /**
     * Render a mosaic of the input file
     * @param {File} file - The input file
     */
    function imageToMosaic(file) {
        // New file selected, clean mosaic result container
        clear();
        // Set status to processing
        setStatus(STATUS_PROCESSING);
        // Load the file into an Image
        Utils.loadImage(file).then(function (image) {
            // Render the image mosaic
            render(image);
        }).catch(function (e) {
            // Set status to error
            setStatus(STATUS_ERROR, e);
            console.error(e);
        });
    }

    /**
     * Render the mosaic of input image
     * @param {Image} image - The input image
    */
    function render(image) {
        var start = performance.now();
        var resultContainer = document.getElementById('mosaic');

        /* Create the canvas mosaic container and append it to the DOM
        * The canvas size match the sliced image per tile without the oddment
        * The canvas need to be in the DOM from the start to show user the render progress row by row 
        */
        var canvas = document.createElement('canvas');
        canvas.width = Math.floor(image.width / TILE_WIDTH) * TILE_WIDTH;
        canvas.height = Math.floor(image.height / TILE_HEIGHT) * TILE_HEIGHT;
        var context = canvas.getContext('2d');
        resultContainer.appendChild(canvas);

        // Transform the image row by row and render each one into the canvas as soon as it's ready
        var r = 0;
        var buildRowsPromise = MosaicBuilder.transformRowByRow(image, TILE_WIDTH, TILE_HEIGHT,
            function (mosaicRowImage) {
                context.drawImage(mosaicRowImage, 0, r * TILE_HEIGHT, image.width, TILE_HEIGHT);
                r++;
            }
        );
        
        // Render completed, log execution time and update status
        buildRowsPromise.then(function () {
            var executionTime = ((performance.now() - start) / 1000).toFixed(3);
            setStatus(STATUS_INITIAL, 'Completed in ' + executionTime);
        }).catch(function (e) {
            // Set status to error
            setStatus(STATUS_ERROR, e);
            console.error(e);
        });
    }

    /**
     * Interrupt the running render
    */
    function cancel() {
        MosaicBuilder.cancel();
        setStatus(STATUS_INITIAL);
    }

    /**
     * Clean the mosaic result area
     */
    function clear() {
        // Remove previous resultContainer
        var resultContainer = document.getElementById('mosaic');
        if(resultContainer.querySelector('canvas')) {
            resultContainer.removeChild(resultContainer.querySelector('canvas'));
        }
    }

    /**
     * Update application status and change UI actions accordingly
     * @param {string} value - The next status
     * @param {object} details - Additional details about the status change
     */
    function setStatus(value, details) {
        // Set and show the new status
        status = value;
        document.querySelector('#status').className = status;
        // Hide/Show details
        var detailsEl = document.querySelector('#status .details');
        detailsEl.style.display = details ? 'block' : 'none';
        detailsEl.innerHTML  = details ? String(details) : '';
        // Enable/Disable file input accordingly to current status
        document.getElementById('file-input').disabled = STATUS_PROCESSING == status;
    }

    /**
     * Initialize the application by:
     * - check the browser compatibility
     * - register drag & drop handler for file select
     * - register input file handler for file select
     */
    function init() {
        
        // guard browser compatibility
        if (!Utils.checkSupportedFeatures()) {
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
            if (status == STATUS_PROCESSING) {
                return false;
            }
            imageToMosaic(e.target.files[0]);
        });

        // Cancel render
        var cancelEl = document.querySelector('.processing a');
        cancelEl.onclick = cancel;

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