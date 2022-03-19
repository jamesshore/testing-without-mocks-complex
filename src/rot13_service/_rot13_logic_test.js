// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13Logic = require("./rot13_logic");

describe("ROT-13 Logic", () => {

	it("does nothing when input is empty", () => {
		assert.equal(rot13Logic.transform(""), "");
	});

	it("transforms lower-case letters", () => {
		assert.equal(rot13Logic.transform("abcdefghijklmnopqrstuvwxyz"), "nopqrstuvwxyzabcdefghijklm");
	});

	it("transforms upper-case letters", () => {
		assert.equal(rot13Logic.transform("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "NOPQRSTUVWXYZABCDEFGHIJKLM");
	});

	it("doesn't transform symbols", () => {
		assertNoTransform(rot13Logic, "`{@[");
	});

	it("doesn't transform numbers", () => {
		assertNoTransform(rot13Logic, "1234567890");
	});

	it("doesn't transform non-English letters", () => {
		assertNoTransform(rot13Logic, "åéîøüçñ");
	});

	it("doesn't break when given emojis", () => {
		assertNoTransform(rot13Logic, "✅🚫🙋");
	});

});

function assertNoTransform(rot13, input) {
	assert.equal(rot13.transform(input), input);
}
