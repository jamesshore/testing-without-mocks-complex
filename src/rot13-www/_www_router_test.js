// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const wwwController = require("./www_controller");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");
const wwwView = require("./www_view");

const VALID_URL = "/";
const VALID_METHOD = "GET";

describe("WWW Router", () => {

	it("routes home page", async () => {
		const requestOptions = {
			url: VALID_URL,
			method: VALID_METHOD,
		};

		const expected = await controllerResponse(requestOptions);
		let actual = await simulateRequestAsync(requestOptions);
		assert.deepEqual(actual, expected);
	});

	it("routes errors", async () => {
		const actual = await simulateRequestAsync({ url: "/no-such-url" });
		const expected = wwwView.errorPage(404, "not found");
		assert.deepEqual(actual, expected);
	});

});

async function controllerResponse(requestOptions) {
	const request = createNullRequest(requestOptions);
	return await wwwController.getAsync(request);
}

async function simulateRequestAsync(requestOptions) {
	const request = createNullRequest(requestOptions);
	const router = WwwRouter.create();
	return await router.routeAsync(request);
}

function createNullRequest({
	url = VALID_URL,
	method = VALID_METHOD,
} = {}) {
	return HttpRequest.createNull({ url, method });
}

