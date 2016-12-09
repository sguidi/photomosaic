(function () {
    "use strict";

    // Application possible statuses
    var STATUS_INITIAL = 'initial';
    var STATUS_PROCESSING = 'processing';
    var STATUS_INCOMPATIBLE = 'incompatible';
    var STATUS_ERROR = 'error';

    // Current status
    var status;

    // Load image and execute callback
    function loadImage(file, callback) {
        console.log('load image');
        // Guard file MIME type
		if(!file.type.match(/image.*/)){
			console.log('File MIME is not image!', file.type);
			return;
		}
        // Read the file via promise
        getReadFilePromise(file).then(callback).catch(function(e) {
            console.log('Read image file failed!', e);
            setStatus(STATUS_ERROR);
        });
    }

    // Return a Promise to async load the file as an ArrayBuffer 
    function getReadFilePromise(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = function(e) {
                reject(e);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Transfor the image buffer to mosaic
    function transform(arrayBuffer) {
        console.log('render image', arrayBuffer.byteLength);
    }

    // Update application status and application behave
    function setStatus(value) {
        status = value;
        document.querySelector('#status').className = status;
        document.getElementById('file-input').disabled = ([STATUS_PROCESSING, STATUS_INCOMPATIBLE].indexOf(status) >= 0);
    }

    // Check Canvas support
    function isCanvasSupported() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    // Initialize the application
    function init() {
        // browser compatibility checks
        if (!isCanvasSupported()) {
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
            loadImage(e.dataTransfer.files[0], render);
        }, true);

        // add File input action
        var fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', function (e) {
            e.preventDefault();
            if (status != STATUS_INITIAL) {
                return false;
            }
            loadImage(e.target.files[0], render);
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