// worker
importScripts('utils.js');

this.onmessage = function (event) {
	var tiles = event.data;
	//var loads = [];
	
	tiles.forEach(function (t) {
		t.hex = Utils.imageHex(t.data);
		//loads.push(Utils.loadTileAjax(t.hex));
	});
	
	/*Promise.all(loads).then(function (tileImages) {
		for (var i = 0; i < tileImages.length; i++) {
			tiles[i].tile = tileImages[i];
		}*/

		this.postMessage(tiles);
	//});
}