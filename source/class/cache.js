(function(){
	"use strict";

	var template_gpx = 
		'<wpt lat="<% lat %>" lon="<% lon %>">\n'+
				'<time><% time %></time>\n'+
				'<name><% gc_code %></name>\n'+
				'<desc><% name %> by <% owner %>, <% type %> (<% difficulty %>/<% terrain %>)</desc>\n'+
				'<url>http://www.geocaching.com/seek/cache_details.aspx?guid=<% guid %></url>\n'+
				'<urlname><% name %></urlname>\n'+
				'<sym><% symbol %></sym>\n'+
				'<type>geocache|<% type %></type>\n'+
				'<groundspeak:cache id="<% cacheid %>" available="<% available %>" archived="<% archived %>" xmlns:groundspeak="http://www.groundspeak.com/cache/1/0/1">\n'+
						'<groundspeak:name><% name %></groundspeak:name>\n'+
						'<groundspeak:placed_by><% owner %></groundspeak:placed_by>\n'+
						'<groundspeak:owner><% owner %></groundspeak:owner>\n'+
						'<groundspeak:type><% type %></groundspeak:type>\n'+
						'<groundspeak:container><% container %></groundspeak:container>\n'+
						'<groundspeak:attributes><% attributes %></groundspeak:attributes>\n'+
						'<groundspeak:difficulty><% difficulty %></groundspeak:difficulty>\n'+
						'<groundspeak:terrain><% terrain %></groundspeak:terrain>\n'+
						'<groundspeak:country><% country %></groundspeak:country>\n'+
						'<groundspeak:state><% state %></groundspeak:state>\n'+
						'<groundspeak:short_description html="true"><% short_description %></groundspeak:short_description>\n'+
						'<groundspeak:long_description html="true"><% long_description %></groundspeak:long_description>\n'+
						'<groundspeak:encoded_hints><% hint %></groundspeak:encoded_hints>\n'+
						'<groundspeak:logs><% logs %></groundspeak:logs>\n'+
				'</groundspeak:cache>\n'+
		'</wpt>';

	var Cache = window.CacheTour.Cache = function(gc_code) {
		this.gc_code = gc_code.toUpperCase();
		this.logs = [];
		this.attributes = [];
	};

	Cache.fromJSON = function(data) {
		var NewCache = new Cache(data.gc_code);
		if (data.name) NewCache.setName(data.name);
		if (data.difficulty) NewCache.setDifficulty(data.difficulty);
		if (data.terrain) NewCache.setTerrain(data.terrain);
		if (data.size) NewCache.setSize(data.size);
		return NewCache;
	};

	Cache.prototype.getGcCode = function() {
		return this.gc_code;
	};
	Cache.prototype.setGcCode = function(gc_code) {
		this.gc_code = gc_code;
		return this;
	};

	Cache.prototype.setName = function(name) {
		this.name = name;
		return this;
	};
	Cache.prototype.getName = function() {
		return this.name;
	};
	
	Cache.prototype.setDifficulty = function(difficulty) {
		this.difficulty = difficulty;
		return this;
	};
	Cache.prototype.getDifficulty = function() {
		return this.difficulty;
	};

	Cache.prototype.setTerrain = function(terrain) {
		this.terrain = terrain;
		return this;
	};
	Cache.prototype.getTerrain = function() {
		return this.terrain;
	};

	Cache.prototype.setSize = function(size) {
		this.size = size;
		return this;
	};
	Cache.prototype.getSize = function() {
		return this.size;
	};

	Cache.prototype.setTour = function(Tour) {
		this.Tour = Tour;
		return this;
	};
	Cache.prototype.matches = function(Cache) {
		return this.gc_code === Cache.getGcCode();
	};

	Cache.prototype.getLink = function() {
		// return "https://coord.info/" + this.gc_code;
		return "https://www.geocaching.com/seek/cache_details.aspx?wp=" + this.gc_code;
	};

	Cache.prototype.addAttribute = function(attribute) {
		this.attributes.push(attribute);
	};

	Cache.prototype.addLog = function(Log) {
		this.logs.push(Log);
	};

	Cache.prototype.setLongDescription = function(description) {
		this.long_description = description;
	};

	Cache.prototype.setShortDescription = function(description) {
		this.short_description = description;
	};

	Cache.prototype.retrieveDetails = function(){
		return new Promise(function(resolve, reject) {
			$.get(this.getLink(), function(result) {
				(new CacheTour.CacheParser(result, this)).parseAttributes().parseDescription().parseLogs();
				resolve();
			}.bind(this)).fail(reject);
		}.bind(this));
	};

	Cache.prototype.toGPX = function() {
		var log_promises = [
			this.retrieveDetails()
		];
		for (var i = 0, c = this.logs.length; i < c; i++) {
			log_promises.push(this.caches[i].toGPX());
		}
		return Promise.all(log_promises).then(function(logs) {
			logs.shift();
			return CacheTour.useTemplate(template_gpx, {
				gc_code: this.gc_code,
				name: this.name,
				logs: logs.join(''),
				attributes: this.attributes.join(''),
				owner: this.owner,
				difficulty: this.difficulty,
				terrain: this.terrain,
				short_description: this.short_description,
				long_description: this.long_description
			});
		}.bind(this));
	};
	Cache.prototype.toElement = function() {
		var element = $('<div class="cachetour_cache">');
		element.append($('<div class="cachetour_cache_name"><a href="' + this.getLink() + '">' + this.name + '</a></div>'));
		element.append($('<div class="cachetour_cache_code">' + this.gc_code + '</div>'));
		element.append($('<div class="cachetour_cache_difficulty">' + this.difficulty + '</div>'));
		element.append($('<div class="cachetour_cache_terrain">' + this.terrain + '</div>'));
		element.append($('<div class="cachetour_cache_size">' + this.size + '</div>'));

		element.append($('<div class="fa fa-trash-o cachetour_cache_delete">').click(function() {
			this.Tour.removeCache(this);
		}.bind(this)));

		var updown = $('<div class="cachetour_cache_order">');
		updown.append($('<div class="cachetour_cache_up fa fa-chevron-up"></div>').click(function(){
			this.Tour.moveCacheUp(this);
		}.bind(this)));

		updown.append($('<div class="cachetour_cache_down fa fa-chevron-down"></div>').click(function(){
			this.Tour.moveCacheDown(this);
		}.bind(this)));

		element.append(updown);

		return element;
	};
	Cache.prototype.toJSON = function() {
		return {
			gc_code: this.gc_code,
			name: this.name,
			difficulty: this.difficulty,
			terrain: this.terrain,
			size: this.size
		};
	};
	Cache.prototype.toString = function() {
		return this.gc_code + " " + this.name;
	};
})();
