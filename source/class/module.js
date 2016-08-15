(function(){
	"use strict";

	var Module = CacheTour.Module = function(options) {
		options = options || {};
		this.name = options.name || 'UNKNOWN';
		this.requirements = options.requirements || {};
		if (typeof options.run === 'function') {
			this.run_function = options.run;
		}
		if (typeof options.init === 'function') {
			this.init_function = options.init;
		}
	};

	Module.prototype.shouldRun = function() {
		return (
				!this.requirements.setting || CacheTour.getSetting(this.requirements.setting)
			) && (
				!this.requirements.url || this.requirements.url.test(document.location.href)
			) && (
				!this.requirements.element || (
					!!(this.element = $(this.requirements.element).first()) &&
					this.element.length > 0
				)
			);
	};

	Module.prototype.getName = function() {
		return this.name;
	};

	Module.prototype.init = function() {
		if (this.init_function) {
			this.init_function();
		}
		return this;
	};
	Module.prototype.run = function() {
		if (this.run_function) {
			this.run_function(this.element);
		}
		return this;
	};

})();

