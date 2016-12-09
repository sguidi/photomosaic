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
        Utils.readImageFile(file).then(function(arrayBuffer){
            transform(arrayBuffer);
        }).catch(function(e){
            setStatus(STATUS_ERROR);
        });
    }

    // Transfor the image buffer to mosaic
    function transform(arrayBuffer) {
        console.log('transform image', arrayBuffer.byteLength);
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