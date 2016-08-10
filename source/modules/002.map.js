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
