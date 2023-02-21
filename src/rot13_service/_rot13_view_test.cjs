// Copyright Titanium I.T. LLC.
const assert = require("util/assert.cjs");
const rot13View = require("./rot13_view.cjs");
const HttpResponse = require("http/http_response.cjs");
const rot13Logic = require("./rot13_logic.cjs");

describe("ROT-13 View", () => {

	it("has success response", () => {
		const expected = HttpResponse.createJsonResponse({
			status: 200,
			body: { transformed: "response" }
		});

		assert.deepEqual(rot13View.ok("response"), expected);
	});

	it("has error response", () => {
		const expected = HttpResponse.createJsonResponse({
			status: 404,
			body: { error: "not found" }
		});

		assert.deepEqual(rot13View.error(404, "not found"), expected);
	});

});

