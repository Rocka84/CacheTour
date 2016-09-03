(function(){
	"use strict";

	CacheTour.addCacheToCurrentTour = function(gc_code, name, size, difficulty, terrain) {
		CacheTour.getCurrentTour().addCache(
				(new CacheTour.Cache(gc_code))
				.setName(name)
				.setSize(size.toLowerCase())
				.setDifficulty(difficulty)
				.setTerrain(terrain)
				);
	};

	CacheTour.registerModule(
		new CacheTour.Module({
			name: 'Map',
			requirements: {
				url: /\/map\//
			},
			init: function() {
				CacheTour.addStyle('#cachetour_gui { top:20%; }');
				CacheTour.addStyle('#cachetour_gui:hover, #cachetour_gui.cachetour_pinned { height:75%; }');

				var template = $("#cacheDetailsTemplate");
				template.html(template.html().replace(
					/<span>Log Visit<\/span>/,
					"<span>Log Visit</span></a>\n" +
					"<a class=\"lnk cachetour-add\" href=\"#\" onclick=\"CacheTour.addCacheToCurrentTour('{{=gc}}', '{{=name}}', '{{=container.text}}', '{{=difficulty.text}}', '{{=terrain.text}}');return false;\">\n" +
					"<img src=\"/images/icons/16/write_log.png\"><span>Add to Tour</span>"
				));
			}
		})
	);
})();
