(function(){
	"use strict";

	CacheTour.registerModule(
		new CacheTour.Module({
			name: "Cache details page",
			requirements: {url: /\/geocache\/|\/cache_details.aspx/},
			run: function() {
				var gpx_button = $('#ctl00_ContentBody_btnSendToGPS').first(),
					add_to_tour_button = gpx_button.clone();

				add_to_tour_button
					.attr("id","cachetour_add_to_tour")
					.attr("onclick","return false")
					.attr("value","Add to Tour");

				add_to_tour_button.click(function(event) {
					event.preventDefault();

					var Parser = new CacheTour.CacheParser(document.body);
					CacheTour.getCurrentTour().addCache(Parser.getCache());
					return false;
				});

				gpx_button.parent().append(add_to_tour_button);
			}
		})
	);
})();
