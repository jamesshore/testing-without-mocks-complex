// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("./ensure");
const EventEmitter = require("events");

/** A utility function for infrastructure wrappers to use track output */
exports.trackOutput = function(emitter, event) {
	ensure.signature(arguments, [ EventEmitter, String ]);

	const output = [];
	const trackerFn = (text) => output.push(text);
	emitter.on(event, trackerFn);

	output.off = () => {
		output.consume();
		emitter.off(event, trackerFn);
	};
	output.consume = () => {
		const result = [ ...output ];
		output.length = 0;
		return result;
	};
	return output;
};
