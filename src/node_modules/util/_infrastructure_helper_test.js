// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("./assert");
const infrastructureHelper = require("./infrastructure_helper");
const EventEmitter = require("events");

describe("Infrastructure Helper", function() {

	describe("output tracker", function() {

		const EVENT = "my_event";

		it("tracks emitted events", function() {
			const { emitter, output } = trackOutput();

			emitter.emit(EVENT, "my output 1");
			emitter.emit(EVENT, "my output 2");

			assert.deepEqual(output, [ "my output 1", "my output 2" ]);
		});

		it("can be turned off", function() {
			const { emitter, output } = trackOutput();

			emitter.emit(EVENT, "my output 1");
			output.off();
			emitter.emit(EVENT, "my output 2");

			assert.deepEqual(output, []);
		});

		it("tracker allows output to be consumed", function() {
			const { emitter, output } = trackOutput();

			emitter.emit(EVENT, "my output 1");
			assert.deepEqual(output.consume(), [ "my output 1" ]);

			emitter.emit(EVENT, "my output 2");
			assert.deepEqual(output.consume(), [ "my output 2" ]);
		});

		it("supports arbitrary data types", function() {
			const { emitter, output } = trackOutput();

			emitter.emit(EVENT, { data: [ "nested", 3.14 ]});
			assert.deepEqual(output, [
				{ data: [ "nested", 3.14 ]}
			]);
		});

		function trackOutput() {
			const emitter = new EventEmitter();
			const output = infrastructureHelper.trackOutput(emitter, EVENT);
			return { emitter, output };
		}

	});

});