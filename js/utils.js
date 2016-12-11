var Utils = (function () {
    'use strict';

    // Check Canvas support
    function isCanvasSupported() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    // Return a Promise to async load the file into an Image obj 
    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            // Guard file MIME type
            if (!file.type.match(/image.*/)) {
                console.log('File MIME is not image!', file.type);
                reject('File is not a valid image');
            }
            //FileReader
            var reader = new FileReader();
            // Handle success
            reader.onload = function (e) {
                var image = new Image();
                // Handle success
                image.onload = function (e) {
                    resolve(e.target);
                }
                image.src = e.target.result;
            };
            // Handle failure
            reader.onerror = function (e) {
                reject(e);
            };
            // Read the input file
            reader.readAsDataURL(file);
        });
    }

    function imageHex(image) {
        var length = image.data.length,
            blockSize = 5, // only visit every 5 pixels
            i = -4,
            length,
            rgb = { r: 0, g: 0, b: 0 },
            count = 0;

        while ((i += blockSize * 4) < length) {
            ++count;
            rgb.r += image.data[i];
            rgb.g += image.data[i + 1];
            rgb.b += image.data[i + 2];
        }

        rgb.r = Math.floor(rgb.r / count);
        rgb.g = Math.floor(rgb.g / count);
        rgb.b = Math.floor(rgb.b / count);

        var hex = ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
        return hex;
    }

    function sliceImage(image, tileW, tileH) {
        var canvas = document.createElement('canvas');
        canvas.width = tileW;
        canvas.height = tileH;
        var context = canvas.getContext('2d');
        var slices = [];
        var rows = Math.floor(image.height / tileH);
        var cols = Math.floor(image.width / tileW);
        var tileData;
        for (var r = 0; r < rows; r++) {
            slices.push([]);
            for (var c = 0; c < cols; c++) {
                context.drawImage(image, tileW * c, tileH * r, tileW, tileH, 0, 0, tileW, tileH);
                slices[r].push({
                    data: context.getImageData(0, 0, tileW, tileH),
                    r: r,
                    c: c,
                    x: c * tileW,
                    y: r * tileH,
                    width: tileW,
                    height: tileH
                });
            }
        }
        return slices;
    }

    function loadTile(hex) {
        return new Promise(function (resolve, reject) {
            var tileImg = new Image();
            tileImg.onload = function (e) {
                resolve(e.target);
            };
            tileImg.src = 'color/' + hex;
        });
    }

    function loadTileAjax(hex) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/color/" + hex);
            xhr.onload = function () {
                resolve(xhr.responseText);
            };
            xhr.send();
        });
    }

    return {
        isCanvasSupported: isCanvasSupported,
        loadImage: loadImage,
        imageHex: imageHex,
        sliceImage: sliceImage,
        loadTile: loadTile,
        loadTileAjax: loadTileAjax
    };

})();

var exports = exports || null;
if (exports) {
    exports.Utils = Utils;
}