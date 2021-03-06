(function(){
	"use strict";

	var attribute_names = [
		'unknown', // thankfully index 0 is unused
		'dogs',
		'fee',
		'rappelling',
		'boat',
		'scuba',
		'kids',
		'onehour',
		'scenic',
		'hiking',
		'climbing',
		'wading',
		'swimming',
		'available',
		'night',
		'winter',
		'16', // to make indexes match attribute-ids
		'poisonoak',
		'snakes',
		'ticks',
		'mine',
		'cliff',
		'hunting',
		'danger',
		'wheelchair',
		'parking',
		'public',
		'water',
		'restrooms',
		'phone',
		'picnic',
		'camping',
		'bicycles',
		'motorcycles',
		'quads',
		'jeeps',
		'snowmobiles',
		'horses',
		'campfires',
		'thorn',
		'stealth',
		'stroller',
		'firstaid',
		'cow',
		'flashlight',
		'landf',
		'46', // to make indexes match attribute-ids
		'field_puzzle',
		'UV',
		'snowshoes',
		'skiis',
		's-tools',
		'nightcache',
		'parkngrab',
		'abandonedbuilding',
		'hike_short',
		'hike_med',
		'hike_long',
		'fuel',
		'food',
		'wirelessbeacon',
		'partnership',
		'seasonal',
		'touristOK',
		'treeclimbing',
		'frontyard',
		'teamwork',
		'geotour'
	];

	//temporary!
	function ucFirst(str) {
		var letters = str.split(''),
			first = letters.shift();
		return first.toUpperCase() + letters.join('');
	}

	var Attribute = CacheTour.Attribute = function(type, invert) {
		this.type = type;
		this.invert = !!invert;
	};

	Attribute.createByName = function(name, invert) {
		return new Attribute(Math.max(attribute_names.indexOf(name), 0), invert);
	};

	Attribute.prototype.getName = function() {
		return attribute_names[this.type];
	};

	Attribute.prototype.getDescription = function(no_prefix) {
		//@todo use internationalized descriptions instead of the attributes name
		return (!no_prefix && this.invert ? 'Not ' : '') + ucFirst(this.getName());
	};

	Attribute.prototype.toGPX = function() {
		return Promise.resolve('<groundspeak:attribute id="' + this.type + '" inc="' + (this.invert ? '0' : '1') + '">' + this.getDescription(true) + '</groundspeak:attribute>');
	};

})();

