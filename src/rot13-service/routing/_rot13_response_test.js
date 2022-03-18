// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13Response = require("./rot13_response");
const HttpResponse = require("http/http_response");

describe("ROT-13 Response", () => {

	it("ok", () => {
		const response = rot13Response.ok("my output");
		assertResponseEquals(response, 200, { transformed: "my output" });
	});

	it("error", () => {
		const response = rot13Response.error(555, "my error");
		assertResponseEquals(response, 555, { error: "my error" });
	});

	it("bad request", () => {
		const response = rot13Response.badRequest("my error");
		assertResponseEquals(response, 400, { error: "my error" });
	});

});

function assertResponseEquals(response, status, body) {
	assert.deepEqual(response, HttpResponse.createJsonResponse({ status, body }));
}
