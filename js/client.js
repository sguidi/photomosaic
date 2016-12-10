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
        Utils.loadImage(file).then( function (image) {
            transform(image);
        }).catch(function (e) {
            setStatus(STATUS_ERROR);
        });
    }

    // Transfor the image to mosaic
    function transform(image) {
        // Slice in tiles with computed hex color code
        var slicePromise = MosaicBuilder.slice(image, TILE_WIDTH, TILE_HEIGHT);
        slicePromise.then(function(slices) {
            console.log(slices);
        });

        
/*
        // Load color based tiles
        var start = performance.now();
        
        var tiles = {};
        slices.forEach(function(s){
            if(!tiles[s.hex]) {
                tiles[s.hex] = null;
            }
        });
        var hexes = Object.keys(tiles);
        var promise = new Promise(function(resolve, reject) {
            var total = hexes.length;
            Object.keys(tiles).forEach( function(h) {
                var tileImg = new Image();
                tileImg.onload = function(e) {
                    tiles[h] = e.target;
                    total --;
                    if(total == 0){
                        resolve();
                    }
                };
                tileImg.src = 'color/' + h;
            });
        });
        promise.then( function () {
            console.log(hexes.length, 'hexes loaded in',
            (performance.now() - start).toFixed(0),
            'loaded %', (hexes.length/slices.length*100).toFixed(2) );
        });*/
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