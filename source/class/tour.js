(function(){
	"use strict";

	var template_gpx =
	'<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\n' +
	'<gpx xmlns:xsi="http://www.w3.org/2001/xmlschema-instance" xmlns:xsd="http://www.w3.org/2001/xmlschema" version="1.0" creator="cachetour" xsi:schemalocation="http://www.topografix.com/gpx/1/0 http://www.topografix.com/gpx/1/0/gpx.xsd http://www.groundspeak.com/cache/1/0/1 http://www.groundspeak.com/cache/1/0/1/cache.xsd" xmlns="http://www.topografix.com/gpx/1/0">\n' +
		'<name><% name %></name>\n' +
		'<desc><% description %></desc>\n' +
		'<author>CacheTour</author>\n' +
		'<url>http://www.geocaching.com</url>\n' +
		'<urlname>geocaching - high tech treasure hunting</urlname>\n' +
		// '<time>' + xsddatetime(new date()) + '</time>\n' +
		'<keywords>cache, geocache</keywords>\n' +
		'<bounds minlat="<% minlat %>" minlon="<% minlon %>" maxlat="<% maxlat %>" maxlon="<% maxlon %>" />\n' +
		'<% caches %>\n' +
		'<% waypoints %>\n' +
	'</gpx>';

	var Tour = window.CacheTour.Tour = function(name){
		this.name = name || 'Tour ' + new Date().toISOString();
		this.caches = [];
		return this;
	};

	Tour.fromJSON = function(data) {
		var tour = new Tour(data.name);
		if (data.caches) {
			for (var i = 0, c = data.caches.length; i < c; i++) {
				tour.addCache(CacheTour.Cache.fromJSON(data.caches[i]).setTour(this));
			}
		}
		return tour;
	};

	Tour.prototype.addCache = function(Cache) {
		if (!this.hasCache(Cache)) {
			this.caches.push(Cache.setTour(this));
			this.fireChange();
		}
		return this;
	};
	Tour.prototype.hasCache = function(Cache) {
		for (var i = 0, c = this.caches.length; i < c; i++) {
			if (this.caches[i].matches(Cache)) return true;
		}
		return false;
	};
	Tour.prototype.moveCacheDown = function(Cache) {
		for (var i = 0, c = this.caches.length - 1; i < c; i++) {
			if (this.caches[i].matches(Cache)) {
				this.caches[i] = this.caches[i + 1];
				this.caches[i + 1] = Cache;
				this.fireChange();
				return true;
			}
		}
		return false;
	};
	Tour.prototype.moveCacheUp = function(Cache) {
		for (var i = 1, c = this.caches.length; i < c; i++) {
			if (this.caches[i].matches(Cache)) {
				this.caches[i] = this.caches[i - 1];
				this.caches[i - 1] = Cache;
				this.fireChange();
				return true;
			}
		}
		return false;
	};
	Tour.prototype.removeCache = function(Cache) {
		for (var i = 0, c = this.caches.length; i < c; i++) {
			if (this.caches[i].matches(Cache)) {
				this.caches.splice(i,1);
				this.fireChange();
				return true;
			}
		}
		return false;
	};
	
	Tour.prototype.getName = function() {
		return this.name;
	};
	Tour.prototype.setName = function(name) {
		this.name = name;
		this.fireChange();
	};

	Tour.prototype.getDescription = function() {
		return this.description;
	};
	Tour.prototype.setDescription = function(description) {
		this.description = description;
		this.fireChange();
	};

	Tour.prototype.onChange = function(callback) {
		this.change_callback = callback;
	};
	Tour.prototype.fireChange = function() {
		if (this.change_callback) {
			this.change_callback();
		}
		return CacheTour;
	};

	Tour.prototype.getCaches = function() {
		return this.caches;
	};

	Tour.prototype.getBounds = function() {
		var min = new CacheTour.Coordinates(999,999),
			max = new CacheTour.Coordinates();
		for (var i = 0, c = this.caches.length; i < c; i++) {
			if (this.caches[i].getCoordinates().getLatitude() < min.getLatitude()) {
				min.setLatitude(this.caches[i].getCoordinates().getLatitude()); 
			}
			if (this.caches[i].getCoordinates().getLatitude() > max.getLatitude()) {
				max.setLatitude(this.caches[i].getCoordinates().getLatitude()); 
			}

			if (this.caches[i].getCoordinates().getLongitude() < min.getLongitude()) {
				min.setLongitude(this.caches[i].getCoordinates().getLongitude()); 
			}
			if (this.caches[i].getCoordinates().getLongitude() > max.getLongitude()) {
				max.setLongitude(this.caches[i].getCoordinates().getLongitude()); 
			}
		}
		return {
			min: min,
			max: max
		};
	};

	Tour.prototype.toGPX = function(on_progress) {
		var cache_promises = [],
		cache_done = function(gpx){
			on_progress('cache', 'done', i);
			return gpx;
		};
		on_progress = on_progress || function(){};
		on_progress('tour', 'start');
		for (var i = 0, c = this.caches.length; i < c; i++) {
			on_progress('cache', 'start', i);
			cache_promises.push(this.caches[i].toGPX().then(cache_done));
		}
		return Promise.all(cache_promises).then(function(caches) {
			on_progress('tour', 'caches_done');
			var bounds = this.getBounds();

			on_progress('tour', 'done');
			return CacheTour.useTemplate(template_gpx, {
				name: this.name,
				caches: caches.join(''),
				minlat: bounds.min.getLatitude(),
				minlon: bounds.min.getLongitude(),
				maxlat: bounds.max.getLatitude(),
				maxlon: bounds.max.getLongitude()
			});
		}.bind(this));
	};
	Tour.prototype.toElement = function() {
		var element = $('<div class="cachetour_tour">'),
			header = $('<div class="cachetour_tour_header">' + this.name + '</div>');
		header.append($('<div class="cachetour_tour_gpx fa fa-pencil" title="Rename Tour">').click(function() {
			var new_name = prompt("Enter the name of this Tour", this.name);
			if (new_name) {
				this.setName(new_name);
				CacheTour.saveSettings();
			}
		}.bind(this)));
		element.append(header);
		for (var i = 0, c = this.caches.length; i < c; i++) {
			element.append(this.caches[i].toElement());
		}
		return element;
	};
	Tour.prototype.toJSON = function() {
		var data = {
			name: this.name,
			description: this.description,
			caches: []
		};
		for (var i = 0, c = this.caches.length; i < c; i++) {
			data.caches.push(this.caches[i].toJSON());
		}
		return data;
	};
	Tour.prototype.toString = function() {
		var out = "";
		for (var i = 0, c = this.caches.length; i < c; i++) {
			out = out + this.caches[i].toString() + "\n";
		}
		return out;
	};

})();
