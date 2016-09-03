(function() {
	"use strict";

	var gui,
		tour_wrapper,
		tour_select_wrapper,
		tour,
		mask,
		mask_message;

	var Gui = CacheTour.Gui = new CacheTour.Module({name: 'Gui'});

	Gui.shouldRun = function(){
		return true;
	};

	Gui.init = function() {
		tour = CacheTour.getCurrentTour();
	};

	Gui.run = function() {
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
		$('<div class="fa fa-download" title="Download current Tour as GPX file">').appendTo(buttonbar).click(downloadGPX);

		$('<div class="fa fa-plus" title="Add another Tour">').appendTo(buttonbar).click(function(){
			console.log("Not implemented yet");
		});

		initTourSelect();
		Gui.updateCacheList();

		return Gui;
 	};

 	function initTourSelect() {
		tour_wrapper = $('<div id="cachetour_tour_wrapper">').appendTo(gui);
		tour_select_wrapper = $('<div id="cachetour_select_wrapper">');
		$('<div class="fa fa-caret-square-o-down" id="cachetour_tour_select_btn">').appendTo(tour_select_wrapper);
	}
 	
 	function downloadGPX() {
		var count = CacheTour.getCurrentTour().getCaches().length,
			cache_pos = 0;

		gui.addClass('cachetour_working');
		Gui.showMask('Creating GPX<br />0 of ' + count + ' Caches done');

		CacheTour.getCurrentTour().toGPX(function(phase, state, index){
			if (phase === 'cache' && state === 'done') {
				cache_pos++;
				$('.cachetour_cache').eq(index).addClass('cachetour_done');
				Gui.showMask('Creating GPX<br />' + (cache_pos) + ' of ' + count + ' Caches done');
			}
		}).then(function(content) {
			CacheTour.saveFile(CacheTour.getCurrentTour().getName() + ".gpx", content);
		}).then(function(){
			Gui.hideMask();
			gui.removeClass('cachetour_working');
		});
	}

	Gui.showMask = function(message) {
		if (!mask) {
			mask = $('<div id="cachetour_mask">').appendTo(document.body);
			$('<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw">').appendTo(mask);
			mask_message = $('<div id="cachetour_mask_message">').appendTo(mask);
		}
		mask_message.html(message || 'Please wait...');
		mask.removeClass('hidden');
		return Gui;
	};

	Gui.hideMask = function () {
		if (mask) {
			mask.addClass('hidden');
		}
		return Gui;
	};

	Gui.setTour = function(_tour) {
		tour = _tour;
		Gui.updateCacheList();
	};

	Gui.updateCacheList = function() {
		tour_wrapper.empty()
			.append(tour_select_wrapper)
			.append(tour.toElement());
		return Gui;
	};
	
	function showTourSelect() {
		// tour_select_wrapper;
		return Gui;
	}

	CacheTour.registerModule(Gui);
})();

