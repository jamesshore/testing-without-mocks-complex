// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13 = require("../logic/rot13");
const rot13Response = require("./rot13_response");
const rot13Controller = require("./rot13_controller");
const HttpRequest = require("http/http_request");

const VALID_HEADERS = { "content-type": "application/json" };

function validBody(text) { return { text }; }

describe("ROT-13 Controller", () => {

	describe("happy path", () => {

		it("transforms requests", async () => {
			const response = await simulateRequestAsync({
				headers: VALID_HEADERS,
				body: validBody("hello"),
			});
			assertOkResponse(response, "hello");
		});

	});


	describe("edge cases", () => {

		it("returns 'bad request' when content-type header isn't JSON", async () => {
			const headers = { "content-type": "text/plain" };
			const response = await simulateRequestAsync({ headers });
			assert.deepEqual(response, rot13Response.badRequest("invalid content-type header"));
		});

		it("returns 'bad request' when JSON fails to parse", async () => {
			const response = await simulateRequestAsync({ body: "not-json" });
			assert.deepEqual(response, rot13Response.badRequest("Unexpected token o in JSON at position 1"));
		});

		it("returns 'bad request' when JSON doesn't have text field", async () => {
			const body = { wrongField: "foo" };
			const response = await simulateRequestAsync({ body });
			assert.deepEqual(response, rot13Response.badRequest("request.text must be a string, but it was undefined"));
		});

		it("ignores extraneous fields", async () => {
			const body = { ignoreMe: "wrong field", text: "right field" };
			const response = await simulateRequestAsync({ body });
			assertOkResponse(response, "right field");
		});

	});

});


async function simulateRequestAsync({
	headers = VALID_HEADERS,
	body = { text: "irrelevant-body" },
} = {}) {
	if (typeof body === "object") body = JSON.stringify(body);

	const request = HttpRequest.createNull({ headers, body });
	return await rot13Controller.postAsync(request);
}

function assertOkResponse(response, originalText) {
	assert.deepEqual(response, rot13Response.ok(rot13.transform(originalText)));

}