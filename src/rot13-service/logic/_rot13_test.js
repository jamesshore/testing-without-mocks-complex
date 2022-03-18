// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13 = require("./rot13");

describe("ROT-13", () => {

	it("does nothing when input is empty", () => {
		assert.equal(rot13.transform(""), "");
	});

	it("transforms lower-case letters", () => {
		assert.equal(rot13.transform("abcdefghijklmnopqrstuvwxyz"), "nopqrstuvwxyzabcdefghijklm");
	});

	it("transforms upper-case letters", () => {
		assert.equal(rot13.transform("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "NOPQRSTUVWXYZABCDEFGHIJKLM");
	});

	it("doesn't transform symbols", () => {
		assertNoTransform(rot13, "`{@[");
	});

	it("doesn't transform numbers", () => {
		assertNoTransform(rot13, "1234567890");
	});

	it("doesn't transform non-English letters", () => {
		assertNoTransform(rot13, "åéîøüçñ");
	});

	it("doesn't break when given emojis", () => {
		assertNoTransform(rot13, "✅🚫🙋");
	});

});

function assertNoTransform(rot13, input) {
	assert.equal(rot13.transform(input), input);
}
