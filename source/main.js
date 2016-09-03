(function(){
	"use strict";
	
	var modules = [],
		settings,
		gui,
		tour_wrapper,
		tour_select_btn,
		mask,
		mask_message,
		styles = [],
		tours = [],
		current_tour = 0;

	function initDependencies() {
		$('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">').appendTo(document.body);
		$('<script src="https://cdn.rawgit.com/eligrey/FileSaver.js/master/FileSaver.min.js">').appendTo(document.body);
	}

	function initGui() {
		createStyles();

		gui = $('<div id="cachetour_gui">').appendTo(document.body);
		
		var header = $('<div id="cachetour_header">').appendTo(gui);
		$('<i class="fa fa-archive main-icon">').appendTo(header);
		$('<span id="cachetour_header">CacheTour</span>').appendTo(header);

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

		var buttonbar = $('<div id="cachetour_buttonbar">').appendTo(gui);
		$('<div class="fa fa-download" title="Download current Tour as GPX file">').appendTo(buttonbar).click(function(){
			var count = CacheTour.getCurrentTour().getCaches().length,
				cache_pos = 0;

			gui.addClass('cachetour_working');
			showMask('Creating GPX<br />0 of ' + count + ' Caches done');

			CacheTour.getCurrentTour().toGPX(function(phase, state, index){
				if (phase === 'cache' && state === 'done') {
					cache_pos++;
					$('.cachetour_cache').eq(index).addClass('cachetour_done');
					showMask('Creating GPX<br />' + (cache_pos) + ' of ' + count + ' Caches done');
				}
			}).then(function(content) {
				CacheTour.saveFile(CacheTour.getCurrentTour().getName() + ".gpx", content);
			}).then(function(){
				hideMask();
				gui.removeClass('cachetour_working');
			});
		});

		$('<div class="fa fa-plus" title="Add another Tour">').appendTo(buttonbar).click(function(){
			console.log("Not implemented yet");
		});

		tour_wrapper = $('<div id="cachetour_tour_wrapper">').appendTo(gui);
		tour_select_btn = $('<i class="fa fa-caret-square-o-down" id="cachetour_tour_select_btn">');
		updateCacheList();
	}

	function createStyles() {
		GM_addStyle(styles.join("\n"));
	}
	
	function showMask(message) {
		if (!mask) {
			mask = $('<div id="cachetour_mask">').appendTo(document.body);
			$('<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw">').appendTo(mask);
			mask_message = $('<div id="cachetour_mask_message">').appendTo(mask);
		}
		mask_message.html(message || 'Please wait...');
		mask.removeClass('hidden');
	}

	function hideMask() {
		if (mask) {
			mask.addClass('hidden');
		}
	}

	function updateCacheList() {
		tour_wrapper.empty().append(tour_select_btn).append(CacheTour.getCurrentTour().toElement());
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

	function selectTour(index) {
		if (index >= 0 && index < tours.length-1) {
			current_tour = index;
			updateCacheList();
		}
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
		updateCacheList();
	}

	var CacheTour = unsafeWindow.CacheTour = window.CacheTour = {
		initialize: function() {
			loadSettings();
			initDependencies();
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
		saveFile: function(filepath, content, type) {
			saveAs(new Blob([content], {type: type || 'text/plain;charset=utf-8'}), filepath);
			return CacheTour;
		},
		escapeHTML: function(html) {
			return $('<div>').text(html).html();
		},
		showMask: showMask,
		hideMask: hideMask
	};
	
})();

