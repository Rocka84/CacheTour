(function(){
	"use strict";
	
	var modules = [],
		settings,
		styles = [],
		tours = [],
		current_tour = 0,
		locales = [],
		locale = 'de';

	function initDependencies() {
		$('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">').appendTo(document.body);
		$('<script src="https://cdn.rawgit.com/eligrey/FileSaver.js/master/FileSaver.min.js">').appendTo(document.body);
	}

	function createStyles() {
		GM_addStyle(styles.join("\n"));
	}
	
	function loadSettings() {
		settings = JSON.parse(GM_getValue("settings") || "{}");
		current_tour = Math.min(settings.current_tour || 0, tours.length - 1);
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
		console.log('tours', tours);
		return CacheTour;
	}

	function initModules() {
		for (var i = 0, c = modules.length; i < c; i++) {
			if (modules[i].shouldRun()) {
				console.info("init Module " + modules[i].getName());
				try {
					modules[i].init();
				} catch (exception) {
					console.error('Exception while initializing module', modules[i].getName());
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
					console.error('Exception in module', modules[i].getName());
					console.error(exception);
				}
			}
		}
	}

	function tourChanged() {
		saveTours();
		CacheTour.Gui.updateCacheList();
	}

	var CacheTour = unsafeWindow.CacheTour = window.CacheTour = {
		initialize: function() {
			initDependencies();
			loadTours();
			loadSettings();

			initModules();
			createStyles();
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
			current_tour = tours.length;
			tours.push(Tour);
			// tourChanged();
			return CacheTour;
		},
		setTourIndex: function(index) {
			current_tour = index;
			CacheTour.Gui.setTour(CacheTour.getCurrentTour());
			CacheTour.saveSettings();
			return CacheTour;
		},
		getCurrentTour: function() {
			return tours[current_tour];
		},
		getTours: function() {
			return tours;
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
			settings.current_tour = current_tour;
			GM_setValue("settings", JSON.stringify(settings));
			return CacheTour;
		},
		saveFile: function(filepath, content, type) {
			saveAs(new Blob([content], {type: type || 'text/plain;charset=utf-8'}), filepath);
			return CacheTour;
		},
		escapeHTML: function(html) {
			return $('<div>').text(html).html();
		},
		registerLocale: function(language, strings) {
			locales[language] = strings;
		},
		setLocale: function(_locale) {
			locale = _locale;
		},
		l10n: function(key) {
			if (locale !== 'en' && !locales[locale][key]) {
				return locales.en[key];
			}
			return locales[locale][key];
		}
	};
	
})();

