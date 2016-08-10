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


/* jshint multistr: true */
(function(){
	"use strict";

	window.CacheTour.registerModule({
		name: "main styles",
		run: function(){
			window.CacheTour.addStyle('#cachetour_gui {\
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
	width: 260px;\
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
#cachetour_gui:hover #cachetour_header span {\
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
');
		}
	});
})();

(function(){
	"use strict";

	CacheTour.registerModule({
		name:'Map',
		url: /\/map\//,
		run: function(){
			CacheTour.addStyle('#cachetour_gui { top:20%; }');
			CacheTour.addStyle('#cachetour_gui:hover { height:75%; }');

			var template = document.getElementById("cacheDetailsTemplate");
			template.innerHTML = template.innerHTML.replace(
				/<span>Log Visit<\/span>/,
				"<span>Log Visit</span></a>\n" +
				"<a class=\"lnk cachetour-add\" href=\"#\" onclick=\"CacheTour.addCacheToCurrentTour('{{=gc}}','{{=name}}');return false;\">\n" +
				"<img src=\"/images/icons/16/write_log.png\"><span>Add to Tour</span>"
			);
		}
	});
})();

(function(){
	"use strict";

	CacheTour.registerModule({
		name: "Cache details page",
		url: /\/geocache\//,
		run: function(){
			var gc_code = $('#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode').first().html(),
				name = $('#ctl00_ContentBody_CacheName').first().html(),
				gpx_button = $('#ctl00_ContentBody_btnSendToGPS').first(),
				add_to_tour_button = gpx_button.clone();

			add_to_tour_button
				.attr("id","cachetour_add_to_tour")
				.attr("onclick","CacheTour.addCacheToCurrentTour('" + gc_code + "','" + name + "');return false;")
				.attr("value","Add to Tour");
			gpx_button.parent().append(add_to_tour_button);
		}
	});
})();

CacheTour.initialize();
