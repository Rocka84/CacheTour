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

