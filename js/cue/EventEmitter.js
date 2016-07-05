
(function () {

	var EventEmitter = function () {
		var _this = this;
		_this.events = {};
	}

	EventEmitter.prototype = {
		on : function(name, handler) {
			if (this.events.hasOwnProperty(name))
			this.events[name].push(handler);
			else
			this.events[name] = [handler];
		},

		removeEventListener : function(name, handler) {
			/* This is a bit tricky, because how would you identify functions?
			This simple solution should work if you pass THE SAME handler. */
			if (!this.events.hasOwnProperty(name))
			return;

			var index = this.events[name].indexOf(handler);
			if (index != -1)
			this.events[name].splice(index, 1);
		},

		emit : function(name, args) {
			if (!this.events.hasOwnProperty(name))
			return;

			// convert so args can be array, object, or any other variable
			args = (args && !Array.isArray(args)) ? [args] : args;
			args = (!args || !args.length) ? [] : args;

			var evs = this.events[name], l = evs.length;
			for (var i = 0; i < l; i++) {
				evs[i].apply(null, args);
			}
		}
	};

	window.EventEmitter = EventEmitter;
	return EventEmitter;
})();
