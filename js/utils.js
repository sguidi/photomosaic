var Utils = (function() {
    'use strict';

    // Check Canvas support
    function isCanvasSupported() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    // Return a Promise to async load the file as an ArrayBuffer 
    function readImageFile(file) {
        return new Promise(function(resolve, reject) {
            // Guard file MIME type
            if(!file.type.match(/image.*/)){
                console.log('File MIME is not image!', file.type);
                reject('File is not a valid image');
            }
            //FileReader
            var reader = new FileReader();
            // Handle success
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            // Handle failure
            reader.onerror = function(e) {
                reject(e);
            };
            // Read the input file
            reader.readAsArrayBuffer(file);
        });
    }

    function imageHex(image) {
        var length = image.data.length,
            blockSize = 5, // only visit every 5 pixels
            i = -4,
            length,
            rgb = {r:0, g:0, b:0},
            count = 0;

        while ((i += blockSize * 4) < length) {
            ++count;
            rgb.r += image.data[i];
            rgb.g += image.data[i+1];
            rgb.b += image.data[i+2];
        }

        rgb.r = Math.floor(rgb.r/count);
        rgb.g = Math.floor(rgb.g/count);
        rgb.b = Math.floor(rgb.b/count);

        var hex = ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
        return hex;
    }

    return {
        isCanvasSupported: isCanvasSupported,
        readImageFile: readImageFile,
        imageHex: imageHex
    };

})();

var exports = exports || null;
if (exports) {
  exports.Utils = Utils;
}