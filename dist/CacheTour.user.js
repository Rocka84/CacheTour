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

	var Cache = window.CacheTour.Cache = function(gc_code) {
		this.gc_code = gc_code.toUpperCase();
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
		return "https://coord.info/" + this.gc_code;
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
					var gc_code = $('#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode').first().html(),
						Cache = new CacheTour.Cache(gc_code),
						name = $('#ctl00_ContentBody_CacheName').first().html(),
						element_size = $('span.minorCacheDetails'),
						element_difficulty = $('#ctl00_ContentBody_uxLegendScale'),
						element_terrain = $('#ctl00_ContentBody_Localize12');

					Cache.setName(name);
					if (element_size.size() > 0 && element_size.first().html().match(/\((.+)\)/)) {
						Cache.setSize(RegExp.$1);
					}

					if (element_terrain.size() > 0 && element_terrain.first().html().match(/stars([\d_]+)\./)) {
						Cache.setTerrain(parseFloat(RegExp.$1.replace('_','.')));
					}

					if (element_difficulty.size() > 0 && element_difficulty.first().html().match(/stars([\d_]+)\./)) {
						Cache.setDifficulty(parseFloat(RegExp.$1.replace('_','.')));
					}

					CacheTour.getCurrentTour().addCache(Cache);
					return false;
				});

				gpx_button.parent().append(add_to_tour_button);
			}
		})
	);
})();

CacheTour.initialize();
