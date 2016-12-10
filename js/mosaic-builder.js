var MosaicBuilder = (function () {
    'use strict';
    
    function buildByRow(image, tileW, tileH) {
        var slices = Utils.sliceImage(image, tileW, tileH);

        // Internal class to build the mosaic
        var builder = new MosaicBuilder();
        // Return a sequence of promises ordered by slices rows
        // Each promise via Web Worker load the hex tile into each slice and resolve
        builder.build(slices);
    }

    function MosaicBuilder(slices) {
        var pool = [];

        function init() {
            
        }
        
        function build(slices) {
            init();
        }
    }

    return {
        buildByRow: buildByRow
    };

})();

var exports = exports || null;
if (exports) {
    exports.MosaicBuilder = MosaicBuilder;
}