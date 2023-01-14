// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const Rot13Router = require("./rot13_router");
const HttpRequest = require("http/http_request");
const Rot13Controller = require("./rot13_controller");
const HttpResponse = require("http/http_response");

const VALID_URL = "/rot13/transform";
const VALID_METHOD = "POST";
const VALID_HEADERS = { "content-type": "application/json" };
const VALID_BODY = JSON.stringify({ text: "hello" });

describe("ROT-13 Router", () => {

	it("routes request", async () => {
		const requestOptions = {
			url: VALID_URL,
			method: VALID_METHOD,
			headers: VALID_HEADERS,
			body: VALID_BODY,
		};

		const expected = await controllerResponse(requestOptions);
		let actual = await simulateRequestAsync(requestOptions);
		assert.deepEqual(actual, expected);
	});

	it("returns JSON errors", async () => {
		const actual = await simulateRequestAsync({ url: "/no-such-url" });
		const expected = HttpResponse.createJsonResponse({
			status: 404,
			body: { error: "not found" }
		});
		assert.deepEqual(actual, expected);
	});

});

async function controllerResponse(requestOptions) {
	const request = createNullRequest(requestOptions);
	return await Rot13Controller.create().postAsync(request);
}

async function simulateRequestAsync(requestOptions) {
	const request = createNullRequest(requestOptions);
	const router = Rot13Router.create();
	return await router.routeAsync(request);
}

function createNullRequest({
	url = VALID_URL,
	method = VALID_METHOD,
	headers = VALID_HEADERS,
	body = VALID_BODY,
} = {}) {
	return HttpRequest.createNull({ url, method, headers, body });
}

