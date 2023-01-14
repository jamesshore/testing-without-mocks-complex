// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
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
		const { response } = await simulateRequestAsync(requestOptions);

		assert.deepEqual(response, expected);
	});

	it("routes errors", async () => {
		const expected = wwwView.errorPage(404, "not found");
		const { response } = await simulateRequestAsync({ url: "/no-such-url" });

		assert.deepEqual(response, expected);
	});

	it("passes configuration with requests", async () => {
		const { log, requests } = await routeAsync({ port: 777 });
		assert.deepEqual(requests.data[0].config, WwwConfig.create(log, 777));
	});

	it("provides log and port", () => {
		const { router, log } = createRouter({ port: 777 });

		assert.equal(router.log, log, "log");
		assert.equal(router.rot13ServicePort, 777, "port");
	});

	it("logs requests", async () => {
		const { logOutput } = await routeAsync({ method: "get", url: "/my_url"});

		assert.deepEqual(logOutput.data, [{
			alert: "info",
			message: "request",
			method: "get",
			path: "/my_url",
		}]);
	});

});

function createRouter({
	port = IRRELEVANT_PORT,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		port: [ undefined, Number ],
	}]]);

	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const router = WwwRouter.create(log, port);
	const requests = router._router.trackRequests();

	return { router, log, logOutput, requests };
}

async function routeAsync(options = {}) {
	ensure.signatureMinimum(arguments, [[ undefined, {
		port: [ undefined, Number ],
	}]]);

	const { port, ...requestOptions} = options;
	const { router, log, logOutput, requests } = createRouter({ port });
	const request = createRequest(requestOptions);
	const response = await router.routeAsync(request);

	return { log, logOutput, requests, response };
}

async function controllerResponse(requestOptions) {
	const request = createRequest(requestOptions);
	return await HomePageController.createNull().getAsync(request, WwwConfig.createNull());
}

async function simulateRequestAsync(requestOptions) {
	const request = createRequest(requestOptions);
	const { router, log } = createRouter();
	const server = HttpServer.createNull();

	await server.startAsync(IRRELEVANT_PORT, log, router);
	const response = await server.simulateRequestAsync(request);

	return { response };
}

function createRequest({
	url = VALID_URL,
	method = VALID_METHOD,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		url: [ undefined, String ],
		method: [ undefined, String ],
	}]]);

	return HttpRequest.createNull({ url, method });
}

