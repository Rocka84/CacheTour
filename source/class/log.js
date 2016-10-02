(function(){
	"use strict";

	var template_gpx = 
		'<groundspeak:log id="<% id %>">\n' +
			'<groundspeak:date><% date %></groundspeak:date>\n' +
			'<groundspeak:type><% type %></groundspeak:type>\n' +
			'<groundspeak:finder><% finder %></groundspeak:finder>\n' +
			'<groundspeak:text encoded="false"><% text %></groundspeak:text>\n' +
		'</groundspeak:log>';

	var Log = window.CacheTour.Log = function() {
	};

	Log.prototype.getId = function() {
		return this.id;
	};
	Log.prototype.setId = function(id) {
		this.id = id;
		return this;
	};

	Log.prototype.getDate = function() {
		return this.date;
	};
	Log.prototype.setDate = function(date) {
		this.date = date;
		return this;
	};

	Log.prototype.getType = function() {
		return this.type;
	};
	Log.prototype.setType = function(type) {
		this.type = type;
		return this;
	};

	Log.prototype.getFinder = function() {
		return this.finder;
	};
	Log.prototype.setFinder = function(finder) {
		this.finder = finder;
		return this;
	};

	Log.prototype.getText = function() {
		return this.finder;
	};
	Log.prototype.setText = function(text) {
		this.text = text;
		return this;
	};

	Log.prototype.toGPX = function() {
		return new Promise(function(resolve, reject) {
			resolve(CacheTour.useTemplate(template_gpx, {
				id: this.id,
				date: this.date,
				type: this.type,
				finder: CacheTour.escapeHTML(this.finder),
				text: this.text.replace(/&nbsp;/ig,'&amp;nbsp;')
			}));
		}.bind(this));
	};
})();

