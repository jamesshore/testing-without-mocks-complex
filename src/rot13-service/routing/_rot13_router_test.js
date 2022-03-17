// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13 = require("../logic/rot13");
const rot13Response = require("./rot13_response");
const rot13Router = require("./rot13_router");
const HttpRequest = require("infrastructure/http_request");

const VALID_URL = "/rot13/transform";
const VALID_METHOD = "POST";
const VALID_HEADERS = { "content-type": "application/json" };

function validBody(text) { return { text }; }

describe("ROT-13 Router", function() {

	describe("happy path", function() {

		it("transforms requests", async function() {
			const response = await simulateRequestAsync({
				url: VALID_URL,
				method: VALID_METHOD,
				headers: VALID_HEADERS,
				body: validBody("hello"),
			});
			assertOkResponse(response, "hello");
		});

		it("ignores query parameters", async function() {
			const response = await simulateRequestAsync({
				url: VALID_URL + "?query",
				body: validBody("hello")
			});
			assertOkResponse(response, "hello");
		});

	});


	describe("bad routing", function() {

		it("returns 'not found' when URL is incorrect", async function() {
			const response = await simulateRequestAsync({ url: "/no-such-url" });
			assert.deepEqual(response, rot13Response.notFound());
		});

		it("returns 'method not allowed' when method isn't POST", async function() {
			const response = await simulateRequestAsync({ method: "get" });
			assert.deepEqual(response, rot13Response.methodNotAllowed());
		});

		it("returns 'bad request' when content-type header isn't JSON", async function() {
			const headers = { "content-type": "text/plain" };
			const response = await simulateRequestAsync({ headers });
			assert.deepEqual(response, rot13Response.badRequest("invalid content-type header"));
		});

	});


	describe("body parsing", function() {

		it("returns 'bad request' when JSON fails to parse", async function() {
			const response = await simulateRequestAsync({ body: "not-json" });
			assert.deepEqual(response, rot13Response.badRequest("Unexpected token o in JSON at position 1"));
		});

		it("returns 'bad request' when JSON doesn't have text field", async function() {
			const body = { wrongField: "foo" };
			const response = await simulateRequestAsync({ body });
			assert.deepEqual(response, rot13Response.badRequest("request.text must be a string, but it was undefined"));
		});

		it("ignores extraneous fields", async function() {
			const body = { ignoreMe: "wrong field", text: "right field" };
			const response = await simulateRequestAsync({ body });
			assertOkResponse(response, "right field");
		});

	});

});


async function simulateRequestAsync({
	url = VALID_URL,
	method = VALID_METHOD,
	headers = VALID_HEADERS,
	body = { text: "irrelevant-body" },
} = {}) {
	if (typeof body === "object") body = JSON.stringify(body);

	const request = HttpRequest.createNull({ url, method, headers, body });
	return await rot13Router.routeAsync(request);
}

function assertOkResponse(response, originalText) {
	assert.deepEqual(response, rot13Response.ok(rot13.transform(originalText)));

}