(function(){
	"use strict";

	var CacheParser = CacheTour.CacheParser = function(source, Cache) {
		this.source = $(source);
		this.Cache = Cache ? Cache : new Cache();
		this.parseBaseData();
	};

	CacheParser.prototype.getCache = function() {
		return this.Cache;
	};

	CacheParser.prototype.parseBaseData = function() {
		var gc_code = this.source.find('#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode').first().html(),
			name = this.source.find('#ctl00_ContentBody_CacheName').first().html(),
			size = this.source.find('span.minorCacheDetails').first().html(),
			difficulty = this.source.find('#ctl00_ContentBody_uxLegendScale').first().html(),
			terrain = this.source.find('#ctl00_ContentBody_Localize12').first().html();

		this.Cache.setGcCode(gc_code);
		this.Cache.setName(name);

		if (size.match(/\((.+)\)/)) {
			this.Cache.setSize(RegExp.$1);
		}

		if (terrain.match(/stars([\d_]+)\./)) {
			this.Cache.setTerrain(parseFloat(RegExp.$1.replace('_','.')));
		}

		if (difficulty.match(/stars([\d_]+)\./)) {
			this.Cache.setDifficulty(parseFloat(RegExp.$1.replace('_','.')));
		}
		return this;
	};

	CacheParser.prototype.parseAttributes = function() {
		//todo
		return this;
	};

	CacheParser.prototype.parseDescription = function() {
		//todo
		return this;
	};

	CacheParser.prototype.parseLogs = function() {
		//todo
		return this;
	};
})();
