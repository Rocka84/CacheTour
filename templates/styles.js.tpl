/* jshint multistr: true */
(function(){
	"use strict";

	window.CacheTour.registerModule({
		name: "main styles",
		run: function(){
			window.CacheTour.addStyle('<%= css %>');
		}
	});
})();
