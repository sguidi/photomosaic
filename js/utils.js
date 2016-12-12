/** Collection of utility functions
 * Externalized from the client/mosaic as indentified generic enough to be reusable in other context
 */
var Utils = (function () {
    'use strict';

    /**
     * Check browser support for needed feature
     * @returns {boolean} check result
     */
    function checkSupportedFeatures() {
        var supported = true;
        // Promise
        supported = supported && (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1);
        // Web Workers
        supported = supported && (typeof Worker !== "undefined" && Worker.toString().indexOf("[native code]") !== -1);
        // Canvas
        var elem = document.createElement('canvas');
        supported = supported && !!(elem.getContext && elem.getContext('2d'));

        return supported;
    }

    /**
     * Async load of an Image from a File
     * @param {File} file - The input file
     * @returns {Promise} - Resolve with loaded Image of reject with error
    */
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

    /**
     * Slice an Image rows and columns into a matrix of tiles with coordinates
     * Right and bottom oddment are ignored
     * @param {Image} image - The image to transform
     * @param {number} tileW - The tile width size
     * @param {number} tileH - The tile heigth size
     * @returns {Array} - The matrix of rows/columns tiles
     */
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
                    x: c * tileW,
                    y: r * tileH,
                    width: tileW,
                    height: tileH
                });
            }
        }
        return slices;
    }

    /**
     * Compute the average color of an Image
     * @param {Image} image - subject of average color computation
     * @param {string} - the hex color 6digits without the initial #
     */
    function imageAverageHex(image) {
        var length = image.data.length,
            blockSize = 8, // only visit every 5 pixels
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


    /**
     * Async load of a tile content from server url 'color/<hex>'
     * @param {string} hex - the hex color in 6-digits format
     * @return {Promise} - Resolve into the loaded content
     */
    function loadTile(hex) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/color/" + hex);
            xhr.onload = function () {
                resolve(xhr.responseText);
            };
            xhr.send();
        });
    }

    /**
     * Create an Image from an SVG in text format
     * @param {string} svgText - the svg content
     * @returns {Promise} resolve with loaded image based on the input svg content
     */
    function getImageFromSVG(svgText) {
        return new Promise(function(resolve, reject){
            var image = new Image();
            image.onload = function (e) {
                // document.getElementById('mosaic').appendChild(image);
                resolve(e.target);
            };
            image.src = 'data:image/svg+xml;base64,'+window.btoa(svgText);
        });
    }

    return {
        checkSupportedFeatures: checkSupportedFeatures,
        loadImage: loadImage,
        sliceImage: sliceImage,
        imageAverageHex: imageAverageHex,
        loadTile: loadTile,
        getImageFromSVG: getImageFromSVG
    };

})();

var exports = exports || null;
if (exports) {
    exports.Utils = Utils;
}