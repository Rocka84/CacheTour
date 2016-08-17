(function(){
	"use strict";

	var template_gpx =
	'<gpx xmlns:xsi="http://www.w3.org/2001/xmlschema-instance" xmlns:xsd="http://www.w3.org/2001/xmlschema" version="1.0" creator="cachetour" xsi:schemalocation="http://www.topografix.com/gpx/1/0 http://www.topografix.com/gpx/1/0/gpx.xsd http://www.groundspeak.com/cache/1/0/1 http://www.groundspeak.com/cache/1/0/1/cache.xsd" xmlns="http://www.topografix.com/gpx/1/0">\n' +
		'<name><% name %></name>\n' +
		'<desc>this is an individual cache generated from geocaching.com</desc>\n' +
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

	Tour.prototype.toGPX = function() {
		var cache_promises = [];
		for (var i = 0, c = this.caches.length; i < c; i++) {
			cache_promises.push(this.caches[i].toGPX());
		}
		return Promise.all(cache_promises).then(function(caches) {
			return CacheTour.useTemplate(template_gpx, {
				name: this.name,
				caches: caches.join('')
			});
		}.bind(this));
	};
	Tour.prototype.toElement = function() {
		var element = $('<div class="cachetour_tour">');
		element.append($('<div class="cachetour_tour_header">' + this.name + '</div>'));
		for (var i = 0, c = this.caches.length; i < c; i++) {
			element.append(this.caches[i].toElement());
		}
		return element;
	};
	Tour.prototype.toJSON = function() {
		var data = {
			name: this.name,
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
