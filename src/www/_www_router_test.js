// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HomePageController = require("./home_page/home_page_controller");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");
const WwwConfig = require("./www_config");
const wwwView = require("./www_view");
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

	it("provides log and port", () => {
		const log = Log.createNull();
		const port = 777;

		const router = WwwRouter.create(log, port);
		assert.equal(router.log, log, "log");
		assert.equal(router.rot13ServicePort, port, "port");
	});

});

async function controllerResponse(requestOptions) {
	const request = createNullRequest(requestOptions);
	return await HomePageController.createNull().getAsync(request, WwwConfig.createNull());
}

async function simulateRequestAsync(requestOptions) {
	const request = createNullRequest(requestOptions);
	const router = WwwRouter.create(Log.createNull(), IRRELEVANT_PORT);
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

