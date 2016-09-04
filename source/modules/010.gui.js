(function() {
	"use strict";

	var gui,
		tour_wrapper,
		tour_select_wrapper,
		tour_select,
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

		var pin = $('<div id="cachetour_pin" class="fa-stack" title="' + CacheTour.l10n('keep_expanded') + '">');
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
		$('<div class="fa fa-download" title="' + CacheTour.l10n('download_gpx_file') + '">').appendTo(buttonbar).click(downloadGPX);

		$('<div class="fa fa-plus" title="' + CacheTour.l10n('add_new_tour') + '">').appendTo(buttonbar).click(function(){
			var tour = new CacheTour.Tour(),
				new_name = prompt(CacheTour.l10n('choose_name'), tour.getName());
			if (new_name) {
				tour.setName();
				CacheTour.addTour(tour);
			}
		});

		initTourSelect();
		Gui.updateCacheList();

		return Gui;
 	};

 	function initTourSelect() {
		tour_wrapper = $('<div id="cachetour_tour_wrapper">').appendTo(gui);
		tour_select_wrapper = $('<div id="cachetour_select_wrapper">');
		$('<div class="fa fa-caret-square-o-down" id="cachetour_tour_select_btn" title="' + CacheTour.l10n('select_tour') + '">').appendTo(tour_select_wrapper);
		gui.delegate('#cachetour_tour_select_btn', 'click', toggleTourSelect);
		tour_select = $('<div id="cachetour_select">').appendTo(tour_select_wrapper);
	}
 	
 	function downloadGPX() {
		var count = CacheTour.getCurrentTour().getCaches().length,
			caches_done = 0;

		gui.addClass('cachetour_working');
		Gui.showMask(CacheTour.l10n('add_new_tour').replace('%pos%', '0').replace('%count%', count));

		CacheTour.getCurrentTour().toGPX(function(phase, state, index){
			if (phase === 'cache' && state === 'done') {
				caches_done++;
				$('.cachetour_cache').eq(index).addClass('cachetour_done');
				Gui.showMask(CacheTour.l10n('add_new_tour').replace('%pos%', caches_done).replace('%count%', count));
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
		mask_message.html(message || CacheTour.l10n('please_wait'));
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
			.append(tour.toElement())
			.append(tour_select_wrapper);
		return Gui;
	};
	
	function showTourSelect() {
		tour_select.empty();
		var tours = CacheTour.getTours();
		for (var i = 0, c = tours.length; i < c; i++) {
			$('<div class="cachetour_select_item" data-index="' + i + '">' + tours[i].getName() + '</div>').appendTo(tour_select);
		}
		tour_select.delegate('.cachetour_select_item', 'click', function(target) {
			CacheTour.setTourIndex($(this).attr('data-index'));
			hideTourSelect();
		});
		tour_select_wrapper.addClass('cachetour_show');
		return Gui;
	}

	function hideTourSelect() {
		tour_select_wrapper.removeClass('cachetour_show');
		return Gui;
	}

	function toggleTourSelect() {
		if (tour_select_wrapper.hasClass('cachetour_show')) {
			hideTourSelect();
		} else {
			showTourSelect();
		}
	}

	CacheTour.registerModule(Gui);
})();
