// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HomePageController = require("./home_page/home_page_controller");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");
const WwwConfig = require("./www_config");
const wwwView = require("./www_view");
const Rot13Router = require("../rot13_service/rot13_router");
const HttpServer = require("http/http_server");
const Log = require("infrastructure/log");

const IRRELEVANT_PORT = 42;

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
	return await HomePageController.createNull().getAsync(request, WwwConfig.createNull());
}

async function simulateRequestAsync(requestOptions) {
	const request = createNullRequest(requestOptions);
	const config = WwwConfig.createNull();
	const router = WwwRouter.create(config);
	const server = HttpServer.createNull();

	await server.startAsync(IRRELEVANT_PORT, Log.createNull(), router);
	return await server.simulateRequestAsync(request);
}

function createNullRequest({
	url = VALID_URL,
	method = VALID_METHOD,
} = {}) {
	return HttpRequest.createNull({ url, method });
}

