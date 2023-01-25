// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const UuidGenerator = require("./uuid_generator");

describe("UUID factory", () => {

	describe("normal instance", () => {

		it("generates unique UUIDs", () => {
			const generator = UuidGenerator.create();

			const uuid1 = generator.generate();
			const uuid2 = generator.generate();
			const uuid3 = generator.generate();

			assert.notEqual(uuid1, uuid2, "uuid1 should not equal uuid2");
			assert.notEqual(uuid1, uuid3, "uuid1 should not equal uuid3");
			assert.notEqual(uuid2, uuid3, "uuid2 should not equal uuid3");
		});

	});


	describe("nulled instance", () => {

		it("defaults to nil UUID", () => {
			const generator = UuidGenerator.createNull();

			assert.equal(generator.generate(), "00000000-0000-0000-0000-000000000000");
		});

		it("allows UUIDs to be configured", () => {
			const generator = UuidGenerator.createNull([ "uuid1", "uuid2", "uuid3" ]);

			assert.equal(generator.generate(), "uuid1");
			assert.equal(generator.generate(), "uuid2");
			assert.equal(generator.generate(), "uuid3");
		});

	});

});
