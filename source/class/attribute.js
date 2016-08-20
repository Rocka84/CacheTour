(function(){
	"use strict";

	var Attribute = CacheTour.Attribute = function(type, invert) {
		this.type = type;
		this.invert = !!invert;
	};

	Attribute.toGPX = function() {
		return new Promise(function(resolve, reject) {
			return '<attribute>' + (this.invert ? 'no ' : '') + '</attribute>';
		});
	};

})();

