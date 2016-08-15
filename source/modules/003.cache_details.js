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
