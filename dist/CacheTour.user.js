// ==UserScript==
// @name          CacheTour
// @namespace     de.rocka84.cachetour
// @version       0.1.0
// @author        Rocka84 <f.dillmeier@gmail.com>
// @description   Collect Geocaches from geocaching.com and download them as single GPX file.
// @run-at        document-end
// @icon          https://github.com/Rocka84/CacheTour/raw/master/icon.png
// @updateURL     https://github.com/Rocka84/CacheTour/raw/master/CacheTour.version.js
// @downloadURL   https://github.com/Rocka84/CacheTour/raw/master/CacheTour.user.js
// @include       http*://www.geocaching.com/*
// @exclude       https://www.geocaching.com/articles
// @exclude       https://www.geocaching.com/about
// @exclude       https://www.geocaching.com/login
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_log
// @grant         GM_addStyle
// @grant         GM_xmlhttpRequest
// @grant         GM_getResourceText
// @grant         GM_getResourceURL
// ==/UserScript==

(function(){
	"use strict";
	
	var modules = [],
		settings,
		gui,
		tour_wrapper,
		styles = [],
		tours = [],
		current_tour = 0;

	function createElement(options, appendTo) {
		options = options || {};
		var element = $('<' + (options.tag||'div') + '>');
		for (var option in options) {
			if (options.hasOwnProperty(option) && option != "tag") {
				element.attr(option, options[option]);
			}
		}
		if (appendTo) {
			$(appendTo).append(element);
		}
		return element;
	}

	function initGui() {
		createElement({tag:"link", rel: "stylesheet", href:"https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"}, document.body);
		createStyles();

		gui = createElement({tag: "div", id: "cachetour_gui"}, document.body);
		
		var header = createElement({tag: "div", id: "cachetour_header"}, gui);
		createElement({tag: "i", "class": "fa fa-archive main-icon"}, header);
		createElement({tag: "span", id: "cachetour_header"}, header).text("CacheTour");

		var pin = $('<div id="cachetour_pin" class="fa-stack">');
		gui.append(pin);
		pin.append($('<div class="fa fa-thumb-tack fa-stack-1x">'));
		pin.append($('<div class="fa fa-ban fa-stack-2x">'));
		pin.on("click",function(){
			gui.toggleClass("cachetour_pinned");
			CacheTour.setSetting("pinned", gui.hasClass("cachetour_pinned"));
		});
		if (CacheTour.getSetting("pinned")) {
			gui.addClass("cachetour_pinned");
		}

		tour_wrapper = createElement({tag: "div", id: "cachetour_tour_wrapper"}, gui);
		updateCacheList();
	}

	function createStyles() {
		GM_addStyle(styles.join("\n"));
	}

	function updateCacheList() {
		tour_wrapper.empty().append(CacheTour.getCurrentTour().toElement());
		return CacheTour;
	}

	function loadSettings() {
		settings = JSON.parse(GM_getValue("settings") || "{}");
		return CacheTour;
	}

	function saveTours() {
		var tour_data = [];
		for (var i = 0, c = tours.length; i < c; i++) {
			tour_data.push(tours[i].toJSON());
		}
		GM_setValue("tours", JSON.stringify(tour_data));
		return CacheTour;
	}

	function loadTours() {
		var tour_data = JSON.parse(GM_getValue("tours") || "[]");
		for (var i = 0, c = tour_data.length; i < c; i++) {
			CacheTour.addTour(CacheTour.Tour.fromJSON(tour_data[i]));
		}
		if (tours.length === 0) {
			CacheTour.addNewTour();
		}
		return CacheTour;
	}

	function initModules() {
		for (var i = 0, c = modules.length; i < c; i++) {
			if (modules[i].shouldRun()) {
				console.info("init Module " + modules[i].getName());
				try {
					modules[i].init();
				} catch (exception) {
					console.error(exception);
				}
			}
		}
	}

	function runModules() {
		for (var i = 0, c = modules.length; i < c; i++) {
			if (modules[i].shouldRun()) {
				console.info("run Module " + modules[i].getName());
				try {
					modules[i].run();
				} catch (exception) {
					console.error(exception);
				}
			}
		}
	}

	function tourChanged() {
		saveTours();
		updateCacheList();
	}

	var CacheTour = unsafeWindow.CacheTour = window.CacheTour = {
		initialize: function() {
			loadSettings();
			initModules();
			loadTours();
			initGui();
			runModules();
		},
		registerModule: function(module) {
			modules.push(module);
			return CacheTour;
		},
		addStyle: function(style) {
			styles.push(style);
			return CacheTour;
		},
		addTour: function(Tour) {
			Tour.onChange(tourChanged);
			tours.push(Tour);
			return CacheTour;
		},
		addNewTour: function(name) {
			return CacheTour.addTour(new CacheTour.Tour(name));
		},
		getCurrentTour: function() {
			return tours[current_tour];
		},
		getTour: function(id) {
			return this.tours[id];
		},
		useTemplate: function(template, data) {
			var out = template;
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					out = out.replace(new RegExp('<% ' + key + ' %>','g'), data[key]);
				}
			}
			return out.replace(/<%.+?%>/g,'');
        },		
		addCacheToCurrentTour: function(gc_code, name) {
			CacheTour.getCurrentTour().addCache(new CacheTour.Cache(gc_code, name));
			return CacheTour;
		},
		getSetting: function(setting) {
			return settings[setting];
		},
		setSetting: function(setting, value, dont_save) {
			if (typeof setting === 'string') {
				settings[setting] = value;
			}
			if (typeof setting === 'object') {
				for(var _setting in setting) {
					if (setting.hasOwnProperty(_setting)) {
						CacheTour.setSetting(_setting, setting[_setting], true);
					}
				}
			}
			return dont_save ? CacheTour : CacheTour.saveSettings();
		},
		saveSettings: function() {
			GM_setValue("settings", JSON.stringify(settings));
			return CacheTour;
		},
		createElement: createElement
	};
	
})();


(function(){
	"use strict";

	var attribute_names = [
		'0', // to make indexes match attribute-ids (which beginn with 1)
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
		'16',
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
		'46',
		'field_puzzle',
		'UV',
		'snowshoes',
		'skiis',
		'tools',
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
		'tourist',
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
		return new Attribute(attribute_names.indexOf(name), invert);
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
				'<groundspeak:cache id="<% cacheid %>" available="<% available %>" archived="<% archived %>" xmlns:groundspeak="http://www.groundspeak.com/cache/1/0/1">\n'+
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

	var Cache = window.CacheTour.Cache = function(gc_code) {
		this.gc_code = gc_code ? gc_code.toUpperCase() : null;
		this.logs = [];
		this.attributes = [];
		this.type = 'regular';
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
		this.gc_code = gc_code.toUpperCase();
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

	Cache.prototype.toGPX = function() {
		var log_promises = [
			this.retrieveDetails()
		];
		for (var i = 0, c = this.logs.length; i < c; i++) {
			log_promises.push(this.logs[i].toGPX());
		}
		return Promise.all(log_promises).then(function(logs) {
			var attrib_promises = [];
			for (var i = 0, c = this.attributes.length; i < c; i++) {
				attrib_promises.push(this.attributes[i].toGPX());
			}
			return Promise.all(attrib_promises).then(function(attributes) {
				logs.shift(); // remove results of retrieveDetails()

				var data = this.toJSON();
				data.logs = logs.join('\n');
				data.attributes = attributes.join('\n');
				data.short_description = this.short_description;
				data.long_description = this.long_description;
				data.lat = this.getCoordinates().getLatitude();
				data.lon = this.getCoordinates().getLongitude();
				data.available = this.available !== false ? 'TRUE' : 'FALSE';
				data.archived = this.archived ? 'TRUE' : 'FALSE';
				data.link = this.getLink();

				return CacheTour.useTemplate(template_gpx, data);
			}.bind(this));
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

(function(){
	"use strict";

	var CacheParser = CacheTour.CacheParser = function(source, Cache) {
		this.source = $(source);
		this.Cache = Cache ? Cache : new CacheTour.Cache();
		this.parseBaseData();
	};

	CacheParser.prototype.getCache = function() {
		return this.Cache;
	};
	
	CacheParser.prototype.parseBaseData = function() {
		var gc_code = this.source.find('#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode').first().html(),
			name = this.source.find('#ctl00_ContentBody_CacheName').first().html(),
			size = this.source.find('span.minorCacheDetails').first().html(),
			difficulty = this.source.find('#ctl00_ContentBody_uxLegendScale').first().html(),
			terrain = this.source.find('#ctl00_ContentBody_Localize12').first().html();

		this.Cache.setGcCode(gc_code);
		this.Cache.setName(name);
		this.Cache.setOwner(this.source.find('#ctl00_ContentBody_mcd1 a').first().text());
		
		this.Cache.setDate(this.source.find('#ctl00_ContentBody_mcd2').text().split('\n')[3].replace(/^ */,''));

		if (size.match(/\((.+)\)/)) {
			this.Cache.setSize(RegExp.$1);
		}

		if (terrain.match(/stars([\d_]+)\./)) {
			this.Cache.setTerrain(parseFloat(RegExp.$1.replace('_','.')));
		}

		if (difficulty.match(/stars([\d_]+)\./)) {
			this.Cache.setDifficulty(parseFloat(RegExp.$1.replace('_','.')));
		}
		return this;
	};

	CacheParser.prototype.parseAllExtras = function() {
		return this
			.parseCoordinates()
			.parseAttributes()
			.parseDescription()
			.parseLogs();
	};

	CacheParser.prototype.parseAttributes = function() {
		this.Cache.clearAttributes();
		this.source.find('#ctl00_ContentBody_detailWidget img').each(function(key,el) {
			if ($(el).attr('src').match(/([^\/]*)-(yes|no)\./)) {
				this.Cache.addAttribute(CacheTour.Attribute.createByName(RegExp.$1, RegExp.$2 === 'no'));
			}
		}.bind(this));
		return this;
	};

	CacheParser.prototype.parseDescription = function() {
		this.Cache.setShortDescription(this.source.find('#ctl00_ContentBody_ShortDescription').first().html());
		this.Cache.setLongDescription(this.source.find('#ctl00_ContentBody_LongDescription').first().html());
		return this;
	};

	CacheParser.prototype.parseCoordinates = function() {
		this.source.find('#uxLatLon').text().match(/[NS] (.+) [EW] (.+)/);
		this.Cache.setCoordinates(new CacheTour.Coordinates(Geo.parseDMS(RegExp.$1), Geo.parseDMS(RegExp.$2)));
		return this;
	};

	CacheParser.prototype.parseLogs = function(limit) {
		this.Cache.clearLogs();
		limit = limit || 20;
		var count = 0;
		this.source.find('#cache_logs_container .log-row').each(function(key,el) {
			if (count < limit) {
				count++;
				var Log = new CacheTour.Log();
				Log.setFinder(this.source.find('.logOwnerProfileName a').first().text())
					.setType(this.source.find('.LogType a img').first().attr('title'))
					.setDate(this.source.find('.LogDate').first().text())
					.setText(this.source.find('.LogText').first().html());
				this.Cache.addLog(Log);
			}
		}.bind(this));
		return this;
	};
})();

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

(function(){
	"use strict";

	var template_gpx = 
		'<groundspeak:log id="<% id %>">\n' +
			'<groundspeak:date><% date %></groundspeak:date>\n' +
			'<groundspeak:type><% type %></groundspeak:type>\n' +
			'<groundspeak:finder><% finder %></groundspeak:finder>\n' +
			'<groundspeak:text encoded="false"><% text %></groundspeak:text>\n' +
		'</groundspeak:log>\n';

	var Log = window.CacheTour.Log = function() {
	};

	Log.prototype.getId = function() {
		return this.id;
	};
	Log.prototype.setId = function(id) {
		this.id = id;
		return this;
	};

	Log.prototype.getDate = function() {
		return this.date;
	};
	Log.prototype.setDate = function(date) {
		this.date = date;
		return this;
	};

	Log.prototype.getType = function() {
		return this.type;
	};
	Log.prototype.setType = function(type) {
		this.type = type;
		return this;
	};

	Log.prototype.getFinder = function() {
		return this.finder;
	};
	Log.prototype.setFinder = function(finder) {
		this.finder = finder;
		return this;
	};

	Log.prototype.getText = function() {
		return this.finder;
	};
	Log.prototype.setText = function(text) {
		this.text = text;
		return this;
	};

	Log.prototype.toGPX = function() {
		return new Promise(function(resolve, reject) {
			resolve(CacheTour.useTemplate(template_gpx, {
				id: this.id,
				date: this.date,
				type: this.type,
				finder: this.finder,
				text: this.text
			}));
		}.bind(this));
	};
})();


(function(){
	"use strict";

	var Module = CacheTour.Module = function(options) {
		options = options || {};
		this.name = options.name || 'UNKNOWN';
		this.requirements = options.requirements || {};
		if (typeof options.run === 'function') {
			this.run_function = options.run;
		}
		if (typeof options.init === 'function') {
			this.init_function = options.init;
		}
	};

	Module.prototype.shouldRun = function() {
		return (
				!this.requirements.setting || CacheTour.getSetting(this.requirements.setting)
			) && (
				!this.requirements.url || this.requirements.url.test(document.location.href)
			) && (
				!this.requirements.element || (
					!!(this.element = $(this.requirements.element).first()) &&
					this.element.length > 0
				)
			);
	};

	Module.prototype.getName = function() {
		return this.name;
	};

	Module.prototype.init = function() {
		if (this.init_function) {
			this.init_function();
		}
		return this;
	};
	Module.prototype.run = function() {
		if (this.run_function) {
			this.run_function(this.element);
		}
		return this;
	};

})();


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

/* jshint multistr: true */
(function(){
	"use strict";
	
	var StylesJS = new CacheTour.Module({name: "main styles"});
	StylesJS.shouldRun = function() {
		return true;
	};
	StylesJS.run = function() {};
	window.CacheTour.registerModule(StylesJS);


	StylesJS.init = function(){
		CacheTour.addStyle('#cachetour_gui {\
	position: fixed;\
	right: 0;\
	top: 80px;\
	width:24px;\
	height:24px;\
	border-style: solid;\
	border-width: 2px 0 2px 2px;\
	border-color: #eee;\
	border-radius: 5px 0 0 5px;\
	background: white;\
	padding: 6px 10px;\
	z-index:1000;\
	overflow: hidden;\
}\
#cachetour_gui:hover, #cachetour_gui.cachetour_pinned {\
	width: 280px;\
	height: 85%;\
}\
\
#cachetour_header {\
	font-weight:bold;\
	font-size:large;\
}\
#cachetour_header span {\
	visibility:hidden;\
	display:inline-block;\
	margin-left:4px;\
}\
#cachetour_header i {\
	color: #444;\
	font-size: x-large;\
}\
#cachetour_gui.cachetour_pinned #cachetour_header span, #cachetour_gui:hover #cachetour_header span {\
	visibility:visible;\
}\
\
#cachetour_tour_wrapper {\
	border-radius:2px;\
}\
#cachetour_tour_wrapper:empty {\
    text-align: center;\
    font-style: italic;\
}\
#cachetour_tour_wrapper:empty:before {\
    content: "- No entries -";\
}\
\
#cachetour_pin {\
	position: absolute;\
    right: 5px;\
    top: 4px;\
    cursor: pointer;\
    visibility:hidden;\
}\
\
#cachetour_gui #cachetour_pin .fa-ban {\
	display: none;\
	color: gray;\
}\
\
#cachetour_gui.cachetour_pinned #cachetour_pin, #cachetour_gui:hover #cachetour_pin {\
	visibility:visible;\
}\
\
#cachetour_gui.cachetour_pinned #cachetour_pin .fa-ban {\
	display:block;\
}\
\
.cachetour_clear {\
	clear:both;\
}\
\
.cachetour_tour {\
	counter-reset: tour;\
}\
\
.cachetour_tour_header {\
	font-size: larger;\
	border-bottom: 1px solid black;\
	text-overflow: ellipsis;\
	white-space: nowrap;\
	overflow: hidden;\
}\
\
.cachetour_cache {\
	border: 1px dashed #DCDCDC;\
	border-radius: 6px;\
	margin-top: 6px;\
	padding: 3px 6px 3px 36px;\
	position:relative;\
}\
.cachetour_cache_name {\
	overflow: hidden;\
}\
.cachetour_cache_code {\
	font-family: monospace;\
	display: inline-block;\
    width:25%;\
}\
.cachetour_cache .cachetour_cache_delete {\
    position: absolute;\
    top: 1px;\
    right: 1px;\
    color: gray;\
    background-color: white;\
    padding: 3px;\
    cursor: pointer;\
    display: none;\
}\
.cachetour_cache:hover .cachetour_cache_delete {\
	display: block;\
}\
.cachetour_cache::before {\
    counter-increment: tour;\
    content: counters(tour, ".") ".";\
    position: absolute;\
    left: 6px;\
    font-size: x-large;\
    color: gray;\
    overflow: hidden;\
    top: -4px;\
}\
.cachetour_cache_difficulty, .cachetour_cache_terrain, .cachetour_cache_size {\
    display: inline-block;\
    position: relative;\
    width: calc(25% - .7em);\
    padding-left:.2em;\
    margin-left:.5em;\
}\
\
.cachetour_cache_difficulty::before, .cachetour_cache_terrain::before, .cachetour_cache_size::before {\
	font-style: italic;\
	font-size: smaller;\
	position: absolute;\
	left: -1.2em;\
	top: 0.2em;\
}\
.cachetour_cache:hover .cachetour_cache_difficulty::before {\
	content: "D: ";\
}\
.cachetour_cache:hover .cachetour_cache_terrain::before {\
	content: "T: ";\
}\
.cachetour_cache:hover .cachetour_cache_size::before {\
	content: "S: ";\
}\
\
.cachetour_cache_order {\
	position: absolute;\
	left: 4px;\
	bottom: 2px;\
	display: none;\
    color: gray;\
}\
.cachetour_cache_order > * {\
	cursor: pointer;\
}\
.cachetour_cache:hover .cachetour_cache_order {\
	display: block;\
}\
.cachetour_tour_header + .cachetour_cache .cachetour_cache_up {\
	visibility: hidden;\
}\
.cachetour_cache:last-of-type .cachetour_cache_down {\
	visibility: hidden;\
}\
\
');
	};
})();


(function(){
	"use strict";
	CacheTour.registerModule(
		new CacheTour.Module({
			name: 'Map',
			requirements: {
				url: /\/map\//
			},
			init: function() {
				CacheTour.addStyle('#cachetour_gui { top:20%; }');
				CacheTour.addStyle('#cachetour_gui:hover { height:75%; }');

				var template = document.getElementById("cacheDetailsTemplate");
				template.html(template.html().replace(
					/<span>Log Visit<\/span>/,
					"<span>Log Visit</span></a>\n" +
					"<a class=\"lnk cachetour-add\" href=\"#\" onclick=\"CacheTour.addCacheToCurrentTour('{{=gc}}','{{=name}}');return false;\">\n" +
					"<img src=\"/images/icons/16/write_log.png\"><span>Add to Tour</span>"
				));
			}
		})
	);
})();

(function(){
	"use strict";

	CacheTour.registerModule(
		new CacheTour.Module({
			name: "Cache details page",
			requirements: {url: /\/geocache\//},
			run: function() {
				var gpx_button = $('#ctl00_ContentBody_btnSendToGPS').first(),
					add_to_tour_button = gpx_button.clone();

				add_to_tour_button
					.attr("id","cachetour_add_to_tour")
					.attr("onclick","return false")
					.attr("value","Add to Tour");

				add_to_tour_button.click(function(event) {
					event.preventDefault();

					var Parser = new CacheTour.CacheParser(document.body);
					CacheTour.getCurrentTour().addCache(Parser.getCache());
					return false;
				});

				gpx_button.parent().append(add_to_tour_button);
			}
		})
	);
})();

CacheTour.initialize();
