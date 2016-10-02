(function(){
	"use strict";

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
					"<a class=\"lnk cachetour_add_to_tour\" href=\"#\" " +
						"onclick=\"$('#cachetour_add_to_tour').click(); return false;\" " +
						"data-gc-code=\"{{=gc}}\" " +
						"data-type=\"{{=type.value}}\" " +
						"data-name=\"{{=name}}\" " +
						"data-size=\"{{=container.text}}\" " +
						"data-difficulty=\"{{=difficulty.text}}\" " +
						"data-terrain=\"{{=terrain.text}}\"" +
					">\n" +
					"<img src=\"/images/icons/16/write_log.png\"><span>Add to Tour</span>"
				));
				
				/*
				 * In Firefox, the sandbox is quite restrictive, so you can't add event handlers
				 * to elements you didn't create yourself. But you may trigger events on elements
				 * you created from outside of the sandbox.
				 * So here I create one static element, whose click event is triggered by the
				 * links that are created from the template above.
				 * Maybe someday I'll find a better solution for this, but this works for now.
				 */
				CacheTour.addStyle('#cachetour_add_to_tour { display:none; }');
				var add_btn = $('<button id="cachetour_add_to_tour">Add Cache</button>').appendTo(document.body).click(function(){
					var cache_link = $('.cachetour_add_to_tour');
					if (cache_link && cache_link.attr('data-gc-code')) {
						CacheTour.getCurrentTour().addCache(
								(new CacheTour.Cache(cache_link.attr('data-gc-code')))
								.setName(cache_link.attr('data-name'))
								.setType(cache_link.attr('data-type'))
								.setSize(cache_link.attr('data-size').toLowerCase())
								.setDifficulty(cache_link.attr('data-difficulty'))
								.setTerrain(cache_link.attr('data-terrain'))
						);
					}
				});
			}
		})
	);
})();
