// Copyright Titanium I.T. LLC.
import assert from "util/assert.js";
import * as rot13Logic from "./rot13_logic.js";

describe("ROT-13 Logic", () => {

	it("does nothing when input is empty", () => {
		assertTransform("", "");
	});

	it("transforms lower-case letters", () => {
		assertTransform("abcdefghijklmnopqrstuvwxyz", "nopqrstuvwxyzabcdefghijklm");
	});

	it("transforms upper-case letters", () => {
		assertTransform("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "NOPQRSTUVWXYZABCDEFGHIJKLM");
	});

	it("doesn't transform symbols", () => {
		assertNoTransform("`{@[");
	});

	it("doesn't transform numbers", () => {
		assertNoTransform("1234567890");
	});

	it("doesn't transform non-English letters", () => {
		assertNoTransform("åéîøüçñ");
	});

	it("doesn't break when given emojis", () => {
		assertNoTransform("✅🚫🙋");
	});

});

function assertTransform(input: string, output: string): void {
	assert.equal(rot13Logic.transform(input), output);
}

function assertNoTransform(input: string): void {
	assert.equal(rot13Logic.transform(input), input);
}
