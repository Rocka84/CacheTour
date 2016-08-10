(function(){
	"use strict";
	
	// var x=document.getElementById("cacheDetailsTemplate");
	
	var modules = [],
		settings = {},
		gui,
		tour_wrapper,
		styles = [],
		caches = [];

	function createElement(options, appendTo) {
		options = options || {};
		var element = document.createElement(options.tag||'div');
		for (var option in options) {
			if (options.hasOwnProperty(option) && option != "tag") {
				element.setAttribute(option, options[option]);
			}
		}
		if (appendTo) {
			appendTo.appendChild(element);
		}
		return element;
	}

	function initGui() {
		console.log("init gui");

		createElement({tag:"link", rel: "stylesheet", href:"https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"}, document.body);
		createStyles();

		gui = createElement({tag: "div", id: "cachetour_gui"}, document.body);
		
		var header = createElement({tag: "div", id: "cachetour_header"}, gui);
		createElement({tag: "i", "class": "fa fa-archive main-icon"}, header);
		createElement({tag: "span", id: "cachetour_header"}, header).innerText="CacheTour";

		tour_wrapper = createElement({tag: "div", id: "cachetour_tour_wrapper"}, gui);
		tour_wrapper.innerHTML = "<center><i>- no entries -</i></center>";
	}

	function createStyles() {
		GM_addStyle(styles.join("\n"));
	}

	function updateCacheList() {
		tour_wrapper.innerHTML = "";
		for (var i = 0, c = caches.length; i < c; i++) {
			createCacheElement(caches[i]);
		}
		return CacheTour;
	}

	function createCacheElement(cache) {
		var element = createElement({
			tag:"div",
			className:"cachetour_cache"
		}, tour_wrapper);
		element.innerHTML = cache.gc_code + " " + cache.name;
		return element;
	}

	function isCacheOnTour(gc_code) {
		for (var i = 0, c = caches.length; i < c; i++) {
			if (caches[i].gc_code === gc_code) return true;
		}
		return false;
	}

	var CacheTour = unsafeWindow.CacheTour = window.CacheTour = {
		initialize: function() {
			CacheTour.initModules();
			initGui();
		},
		registerModule: function(module) {
			modules.push(module);
			return CacheTour;
		},
		initModules: function () {
			for (var i = 0, c = modules.length; i < c; i++) {
				try {
					var el;
					if (
							typeof modules[i].run === 'function' &&
							(!('setting' in modules[i]) || settings[modules[i].setting]) &&
							(!('url' in modules[i]) || modules[i].url.test(document.location.href)) &&
							(!('element' in modules[i]) || (!!(el = $(modules[i].element)) && el.length > 0))
					) {
						console.log("Running module " + modules[i].name);
						modules[i].run(el?el[0]:null);
					}
				} catch (ex) {
					console.error(modules[i].name, ex);
				}
			}
			return CacheTour;
		},
		addStyle: function(style) {
			styles.push(style);
			return CacheTour;
		},
		addCacheToCurrentTour: function(gc_code, name) {
			if (!isCacheOnTour(gc_code)) {
				console.log('adding ' + gc_code + ' - ' + name);
				caches.push({gc_code:gc_code, name:name});
				updateCacheList();
			}
			return CacheTour;
		}
	};
	
})();

