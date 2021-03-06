(function(){
	"use strict";

	var template_gpx = 
		'<wpt lat="<% lat %>" lon="<% lon %>">\n'+
				'<time><% date %></time>\n'+
				'<name><% gc_code %></name>\n'+
				'<desc><% name %> by <% owner %>, <% type %> (<% difficulty %>/<% terrain %>)</desc>\n'+
				'<url><% link %></url>\n'+
				'<urlname><% name %></urlname>\n'+
				'<sym><% symbol %></sym>\n'+
				'<type>geocache|<% type %></type>\n'+
				'<groundspeak:cache id="<% id %>" available="<% available %>" archived="<% archived %>" xmlns:groundspeak="http://www.groundspeak.com/cache/1/0/1">\n'+
						'<groundspeak:name><% name %></groundspeak:name>\n'+
						'<groundspeak:placed_by><% owner %></groundspeak:placed_by>\n'+
						'<groundspeak:owner><% owner %></groundspeak:owner>\n'+
						'<groundspeak:type><% type %></groundspeak:type>\n'+
						'<groundspeak:container><% size %></groundspeak:container>\n'+
						'<groundspeak:difficulty><% difficulty %></groundspeak:difficulty>\n'+
						'<groundspeak:terrain><% terrain %></groundspeak:terrain>\n'+
						'<groundspeak:country><% country %></groundspeak:country>\n'+
						'<groundspeak:state><% state %></groundspeak:state>\n'+
						'<groundspeak:attributes>\n<% attributes %>\n</groundspeak:attributes>\n'+
						'<groundspeak:short_description html="true"><% short_description %></groundspeak:short_description>\n'+
						'<groundspeak:long_description html="true"><% long_description %></groundspeak:long_description>\n'+
						'<groundspeak:encoded_hints><% hint %></groundspeak:encoded_hints>\n'+
						'<groundspeak:logs>\n<% logs %>\n</groundspeak:logs>\n'+
				'</groundspeak:cache>\n'+
		'</wpt>';

	var types = {
		2: {
			name: 'traditional',
			icon: "/images/WptTypes/2.gif"
		},
		3: {
			name: 'multi',
			icon: "/images/WptTypes/3.gif"
		},
		4: {
			name: 'virtual',
			icon: "/images/WptTypes/4.gif"
		},
		5: {
			name: 'letterbox',
			icon: "/images/WptTypes/5.gif"
		},
		6: {
			name: 'event',
			icon: "/images/WptTypes/6.gif"
		},
		8: {
			name: 'mystery',
			icon: "/images/WptTypes/8.gif"
		},
		11: {
			name: 'webcam',
			icon: "/images/WptTypes/11.gif"
		},
		13: {
			name: 'cito',
			icon: "/images/WptTypes/13.gif"
		},
		137: {
			name: 'earthcache',
			icon: "/images/WptTypes/137.gif"
		},
		1858: {
			name: 'wherigo',
			icon: "/images/WptTypes/1858.gif"
		}
	};

	var Cache = window.CacheTour.Cache = function(gc_code) {
		this.gc_code = gc_code ? gc_code.toUpperCase() : null;
		this.logs = [];
		this.attributes = [];
		this.type = 'traditional';
	};

	Cache.fromJSON = function(data) {
		var NewCache = new Cache(data.gc_code);
		if (data.name) NewCache.setName(data.name);
		if (data.type) NewCache.setType(data.type);
		if (data.difficulty) NewCache.setDifficulty(data.difficulty);
		if (data.terrain) NewCache.setTerrain(data.terrain);
		if (data.size) NewCache.setSize(data.size);
		return NewCache;
	};

	Cache.prototype.getGcCode = function() {
		return this.gc_code;
	};
	Cache.prototype.setGcCode = function(gc_code) {
		this.gc_code = gc_code.toUpperCase();
		return this;
	};

	Cache.prototype.getId = function() {
		return this.id;
	};
	Cache.prototype.setId = function(id) {
		this.id = id;
		return this;
	};

	Cache.prototype.setName = function(name) {
		this.name = name;
		return this;
	};
	Cache.prototype.getName = function() {
		return this.name;
	};
	
	Cache.prototype.setType = function(type) {
		this.type = type;
		return this;
	};
	Cache.prototype.getType = function() {
		return this.type;
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

	Cache.prototype.setDate = function(date) {
		this.date = date;
		return this;
	};
	Cache.prototype.getDate = function() {
		return this.date;
	};

	Cache.prototype.setOwner = function(owner) {
		this.owner = owner;
		return this;
	};
	Cache.prototype.getOwner = function() {
		return this.owner;
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
		return this;
	};

	Cache.prototype.clearAttributes = function() {
		this.attributes = [];
		return this;
	};

	Cache.prototype.addLog = function(Log) {
		this.logs.push(Log);
		return this;
	};

	Cache.prototype.clearLogs = function() {
		this.logs = [];
		return this;
	};

	Cache.prototype.setLongDescription = function(description) {
		this.long_description = description;
	};

	Cache.prototype.setShortDescription = function(description) {
		this.short_description = description;
	};

	Cache.prototype.getCoordinates = function() {
		if (!this.coordinates) {
			this.coordinates = new CacheTour.Coordinates();
		}
		return this.coordinates;
	};

	Cache.prototype.setCoordinates = function(coordinates) {
		this.coordinates = coordinates;
	};

	Cache.prototype.retrieveDetails = function(){
		return new Promise(function(resolve, reject) {
			$.get(this.getLink(), function(result) {
				(new CacheTour.CacheParser(result, this)).parseAllExtras();
				resolve();
			}.bind(this)).fail(reject);
		}.bind(this));
	};

	Cache.getTypeName = function(type) {
		return types[type].name;
	};

	Cache.getTypeText = function(type) {
		return CacheTour.l10n("cachetype_" + type);
	};

	Cache.getTypeIcon = function(type) {
		return types[type] ? types[type].icon : null;
	};

	Cache.getTypeIdByName = function(name) {
		for(var id in types) {
			if (types[id].name === name) {
				return id;
			}
		}
		return null;
	};

	Cache.prototype.toGPX = function() {
		var logs;
		return this.retrieveDetails().then(function() {
			var log_promises = [];
			for (var i = 0, c = this.logs.length; i < c; i++) {
				log_promises.push(this.logs[i].toGPX());
			}
			return Promise.all(log_promises);
		}.bind(this)).then(function(_logs) {
			logs = _logs;
			var attrib_promises = [];
			for (var i = 0, c = this.attributes.length; i < c; i++) {
				attrib_promises.push(this.attributes[i].toGPX());
			}
			return Promise.all(attrib_promises);
		}.bind(this)).then(function(attributes) {
			var data = this.toJSON();
			data.type = CacheTour.l10n('cachetype_' + data.type, 'en');
			data.logs = logs.join('\n');
			data.attributes = attributes.join('\n');
			data.short_description = CacheTour.escapeHTML(this.short_description);
			data.long_description = CacheTour.escapeHTML(this.long_description);
			data.lat = this.getCoordinates().getLatitude();
			data.lon = this.getCoordinates().getLongitude();
			data.available = this.available !== false ? 'TRUE' : 'FALSE';
			data.archived = this.archived ? 'TRUE' : 'FALSE';
			data.link = this.getLink();

			return CacheTour.useTemplate(template_gpx, data);
		}.bind(this));
	};
	Cache.prototype.toElement = function() {
		var element = $('<div class="cachetour_cache">');
		element.append($('<img class="cachetour_cache_icon" src="' + Cache.getTypeIcon(this.type) + '">'));
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
			id: this.id,
			type: this.type,
			name: this.name,
			owner: this.owner,
			difficulty: this.difficulty,
			terrain: this.terrain,
			available: this.available,
			archived: this.archived,
			size: this.size,
			date: this.date
		};
	};
	Cache.prototype.toString = function() {
		return this.gc_code + " " + this.name;
	};
})();
