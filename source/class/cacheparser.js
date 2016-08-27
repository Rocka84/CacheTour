(function(){
	"use strict";

	var CacheParser = CacheTour.CacheParser = function(source, Cache) {
		this.source_raw = source;
		this.source = $(source);
		this.Cache = Cache ? Cache : new CacheTour.Cache();
		this.parseBaseData();
	};

	CacheParser.prototype.getCache = function() {
		return this.Cache;
	};
	
	CacheParser.prototype.parseBaseData = function() {
		// console.log('base', this.source);
		var gc_code = this.source.find('#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode').first().html();

		this.Cache.setId(this.source.find('.LogVisit').attr('href').match(/ID=(\d+)/)[1]);
		this.Cache.setGcCode(gc_code);
		this.Cache.setType(this.source.find('.cacheImage img').attr('alt').replace(/( Geo|\-)[Cc]ache/, '').toLowerCase());
		this.Cache.setName(this.source.find('#ctl00_ContentBody_CacheName').first().text());
		this.Cache.setOwner(this.source.find('#ctl00_ContentBody_mcd1 a').first().text());
		this.Cache.setDate(this.source.find('#ctl00_ContentBody_mcd2').text().split('\n')[3].replace(/^ */,''));

		if (this.source.find('span.minorCacheDetails').first().text().match(/\((.+)\)/)) {
			this.Cache.setSize(RegExp.$1);
		}

		if (this.source.find('#ctl00_ContentBody_Localize12').first().html().match(/stars([\d_]+)\./)) {
			this.Cache.setTerrain(parseFloat(RegExp.$1.replace('_','.')));
		}

		if (this.source.find('#ctl00_ContentBody_uxLegendScale').first().html().match(/stars([\d_]+)\./)) {
			this.Cache.setDifficulty(parseFloat(RegExp.$1.replace('_','.')));
		}
		return this;
	};

	CacheParser.prototype.parseAllExtras = function() {
		return this
			.parseCoordinates()
			.parseAttributes()
			.parseDescription()
			.parseLogs();
	};

	CacheParser.prototype.parseAttributes = function() {
		this.Cache.clearAttributes();
		this.source.find('#ctl00_ContentBody_detailWidget img').each(function(key,el) {
			if ($(el).attr('src').match(/([^\/]*)-(yes|no)\./)) {
				this.Cache.addAttribute(CacheTour.Attribute.createByName(RegExp.$1, RegExp.$2 === 'no'));
			}
		}.bind(this));
		return this;
	};

	CacheParser.prototype.parseDescription = function() {
		this.Cache.setShortDescription(this.source.find('#ctl00_ContentBody_ShortDescription').first().html());
		this.Cache.setLongDescription(this.source.find('#ctl00_ContentBody_LongDescription').first().html());
		return this;
	};

	CacheParser.prototype.parseCoordinates = function() {
		var parts = this.source.find('#uxLatLon').text().match(/[NS] (.+) [EW] (.+)/);
		this.Cache.setCoordinates(new CacheTour.Coordinates(Geo.parseDMS(parts[1]), Geo.parseDMS(parts[2])));
		return this;
	};

	CacheParser.prototype.parseLogs = function(limit) {
		// console.log('logs', this.source.find('script').html());
		this.Cache.clearLogs();
		limit = limit || 20;
		if (this.source_raw.match(/initalLogs\s*=\s*(\{.*\});/)) {
			var initialLogs = JSON.parse(RegExp.$1).data;
			for (var i = 0, c = Math.min(limit, initialLogs.length); i < c; i++) {
				var Log = new CacheTour.Log();
				Log.setId(initialLogs[i].LogID)
					.setFinder(initialLogs[i].UserName)
					.setType(initialLogs[i].LogType)
					.setDate(initialLogs[i].Visited)
					.setText(CacheTour.escapeHTML(initialLogs[i].LogText));
				this.Cache.addLog(Log);
			}
		}
		return this;
	};
})();
