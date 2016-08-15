/* jshint multistr: true */
(function(){
	"use strict";
	
	var StylesJS = new CacheTour.Module({name: "main styles"});
	StylesJS.shouldRun = function() {
		return true;
	};
	StylesJS.run = function() {};
	window.CacheTour.registerModule(StylesJS);


	StylesJS.init = function(){
		CacheTour.addStyle('<%= css %>');
	};
})();

