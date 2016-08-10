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
