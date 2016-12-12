// worker
importScripts('utils.js');

/**
 * Compute for each cell its average hex color and post back the computed result
 * @param {object} event - event.data contains an image row of cells
 */
this.onmessage = function (event) {
	var cells = event.data;
	var loads = [];

	cells.forEach(function (c) {
		c.hex = Utils.imageAverageHex(c.data);
		loads.push(Utils.loadTileAjax(c.hex));
	});
	
	Promise.all(loads).then(function(tiles){
		cells.forEach(function(c, index){ c.tile = tiles[index];});
		this.postMessage(cells);
	});
}