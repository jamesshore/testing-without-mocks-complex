// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13 = require("../logic/rot13");
const rot13Response = require("./rot13_response");
const rot13Router = require("./rot13_router");
const HttpRequest = require("../infrastructure/http_request");
const Clock = require("infrastructure/clock");

const VALID_URL = "/rot13/transform";
const VALID_METHOD = "POST";
const VALID_HEADERS = { "content-type": "application/json" };
function validBody(text) { return { text }; }

describe("ROT-13 Router", function() {

	describe("happy path", function() {

		it("transforms requests when current timestamp is even", async function() {
			const response = await simulateImmediateRequestAsync({
				url: VALID_URL,
				method: VALID_METHOD,
				headers: VALID_HEADERS,
				body: validBody("hello"),
			});
			assertOkResponse(response, "hello");
		});

		it("delays for 30 seconds before transforming request when current timestamp is odd",  async function() {
			const { responsePromise, clock } = simulateDelayedRequest({
				url: VALID_URL,
				method: VALID_METHOD,
				headers: VALID_HEADERS,
				body: validBody("hello"),
			});

			let promiseResolved = false;
			responsePromise.then(() => {
				promiseResolved = true;
			});

			await clock.advanceNullAsync(29999);
			assert.equal(promiseResolved, false, "response should not resolve before 30 seconds");
			await clock.advanceNullAsync(1);
			assert.equal(promiseResolved, true, "response should resolve at 30 seconds");

			assertOkResponse(await responsePromise, "hello");
		});

		it("ignores query parameters", async function() {
			const response = await simulateImmediateRequestAsync({ url: VALID_URL + "?query", body: validBody("hello") });
			assertOkResponse(response, "hello");
		});

	});


	describe("bad routing", function() {

		it("returns 'not found' when URL is incorrect", async function() {
			const response = await simulateImmediateRequestAsync({ url: "/no-such-url" });
			assert.deepEqual(response, rot13Response.notFound());
		});

		it("returns 'method not allowed' when method isn't POST", async function() {
			const response = await simulateImmediateRequestAsync({ method: "get" });
			assert.deepEqual(response, rot13Response.methodNotAllowed());
		});

		it("returns 'bad request' when content-type header isn't JSON", async function() {
			const headers = { "content-type": "text/plain" };
			const response = await simulateImmediateRequestAsync({ headers });
			assert.deepEqual(response, rot13Response.badRequest("invalid content-type header"));
		});

		it("fails immediately regardless of timestamp", async function() {
			const { responsePromise } = simulateDelayedRequest({ url: "/no-such-url" });
			assert.deepEqual(await responsePromise, rot13Response.notFound());
		});

	});


	describe("body parsing", function() {

		it("returns 'bad request' when JSON fails to parse", async function() {
			const response = await simulateImmediateRequestAsync({ body: "not-json" });
			assert.deepEqual(response, rot13Response.badRequest("Unexpected token o in JSON at position 1"));
		});

		it("returns 'bad request' when JSON doesn't have text field", async function() {
			const body = { wrongField: "foo" };
			const response = await simulateImmediateRequestAsync({ body });
			assert.deepEqual(response, rot13Response.badRequest("request.text must be a string, but it was undefined"));
		});

		it("ignores extraneous fields", async function() {
			const body = { ignoreMe: "wrong field", text: "right field" };
			const response = await simulateImmediateRequestAsync({ body });
			assertOkResponse(response, "right field");
		});

	});

});


async function simulateImmediateRequestAsync({
	url = VALID_URL,
	method = VALID_METHOD,
	headers = VALID_HEADERS,
	body = { text: "irrelevant-body" },
} = {}) {
	if (typeof body === "object") body = JSON.stringify(body);

	const request = HttpRequest.createNull({ url, method, headers, body });
	const clock = Clock.createNull({ now: 2 });
	return await rot13Router.routeAsync(request, clock);
}

function simulateDelayedRequest({ url, method, headers, body }) {
	const request = HttpRequest.createNull({ url, method, headers, body: JSON.stringify(body) });
	const clock = Clock.createNull({ now: 3 });
	const responsePromise = rot13Router.routeAsync(request, clock);

	return { responsePromise, clock };
}

function assertOkResponse(response, originalText) {
	assert.deepEqual(response, rot13Response.ok(rot13.transform(originalText)));

}