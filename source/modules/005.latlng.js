(function(){
	"use strict";

	CacheTour.registerModule(
		new CacheTour.Module({
			name: 'Add latlng.js',
			run: function() {
				if ($('script[src*="latlng.js"]').length===0) {
					$('<script src="https://www.geocaching.com/js/latlng.js">').appendTo(document.body);
				}
			},
			shouldRun: function() {
				return true;
			}
		})
	);

})();
