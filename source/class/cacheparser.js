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
		this.source.find('#ctl00_ContentBody_detailWidget img').each(function(key,el) {
			this.Cache.addAttribute($(el).attr('title'));
		}.bind(this));
		return this;
	};

	CacheParser.prototype.parseDescription = function() {
		this.Cache.setShortDescription(this.source.find('#ctl00_ContentBody_ShortDescription').first().html());
		this.Cache.setLongDescription(this.source.find('#ctl00_ContentBody_LongDescription').first().html());
		return this;
	};

	CacheParser.prototype.parseLogs = function(limit) {
		limit = limit || 20;
		var count = 0;
		this.source.find('#cache_logs_container .log-row').each(function(key,el) {
			if (count < limit) {
				count++;
				var Log = new CacheTour.Log();
				Log.setFinder(this.source.find('.logOwnerProfileName a').first().text());
				Log.setType(this.source.find('.LogType a img').first().attr('title'));
				Log.setDate(this.source.find('.LogDate').first().text());
				Log.setText(this.source.find('.LogText').first().html());
				this.Cache.addLog(Log);
			}
		}.bind(this));
		return this;
	};
})();
