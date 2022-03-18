// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13Router = require("./rot13_router");
const HttpRequest = require("http/http_request");
const rot13Controller = require("./rot13_controller");
const HttpResponse = require("http/http_response");

const VALID_URL = "/rot13/transform";
const VALID_METHOD = "POST";
const VALID_HEADERS = { "content-type": "application/json" };
const VALID_BODY = { text: "hello" };

describe("ROT-13 Router", () => {

	it("routes request", async () => {
		const requestOptions = {
			url: VALID_URL,
			method: VALID_METHOD,
			headers: VALID_HEADERS,
			body: VALID_BODY,
		};

		const expected = await routerResponse(requestOptions);
		let actual = await simulateRequestAsync(requestOptions);
		assert.deepEqual(actual, expected);
	});

	it("ignores query parameters", async () => {
		const requestOptions = {
			url: VALID_URL + "?query",
		};

		const expected = await routerResponse(requestOptions);
		let actual = await simulateRequestAsync(requestOptions);
		assert.deepEqual(actual, expected);
	});

	it("returns 'not found' when URL is incorrect", async () => {
		const response = await simulateRequestAsync({ url: "/no-such-url" });
		assert.deepEqual(response, errorResponse(404, "not found"));
	});

	it("returns 'method not allowed' when method isn't POST", async () => {
		const response = await simulateRequestAsync({ method: "get" });
		assert.deepEqual(response, errorResponse(405, "method not allowed"));
	});

});


async function simulateRequestAsync(requestOptions) {
	const request = createNullRequest(requestOptions);
	return await rot13Router.routeAsync(request);
}

async function routerResponse(requestOptions) {
	const request = createNullRequest(requestOptions);
	return await rot13Controller.postAsync(request);
}

function createNullRequest({
	url = VALID_URL,
	method = VALID_METHOD,
	headers = VALID_HEADERS,
	body = { text: "irrelevant-body" },
} = {}) {
	if (typeof body === "object") body = JSON.stringify(body);
	return HttpRequest.createNull({ url, method, headers, body });
}

function errorResponse(status, error) {
	return HttpResponse.createJsonResponse({
		status,
		body: { error }
	});
}