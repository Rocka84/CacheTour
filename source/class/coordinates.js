(function() {
	"use strict";

	var Coordinates = CacheTour.Coordinates = function(latitude, longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	};

	Coordinates.prototype.setLatitude = function(latitude) {
		this.latitude = latitude;
		return this;
	};

	Coordinates.prototype.getLatitude = function() {
		return this.latitude;
	};

	Coordinates.prototype.setLongitude = function(longitude) {
		this.longitude = longitude;
		return this;
	};

	Coordinates.prototype.getLongitude = function() {
		return this.longitude;
	};

	Coordinates.prototype.getDistance = function(OtherCoordinates) {
		//@todo this method isn't entirely correct for geo-coordinates
		return Math.sqrt(Math.pow(this.latitude - OtherCoordinates.getLatitude(), 2) + Math.pow(this.longitude - OtherCoordinates.getLongitude(), 2));
	};
})();
