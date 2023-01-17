// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const Rot13Router = require("./rot13_router");
const HttpServer = require("http/http_server");
const HttpRequest = require("http/http_request");
const Rot13Controller = require("./rot13_controller");
const HttpResponse = require("http/http_response");
const Log = require("infrastructure/log");
const ensure = require("util/ensure");

const IRRELEVANT_PORT = 42;

const VALID_URL = "/rot13/transform";
const VALID_METHOD = "POST";
const VALID_HEADERS = {
	"content-type": "application/json",
	"x-request-id": "irrelevant-request-id",
};
const VALID_BODY = JSON.stringify({ text: "hello" });

describe("ROT-13 Router", () => {

	it("routes transform endpoint", async () => {
		const requestOptions = {
			url: VALID_URL,
			method: VALID_METHOD,
			headers: VALID_HEADERS,
			body: VALID_BODY,
		};

		const expected = await controllerResponse(requestOptions);
		const response = await simulateRequestAsync(requestOptions);
		assert.deepEqual(response, expected);
	});

	it("returns JSON errors", async () => {
		const expected = HttpResponse.createJsonResponse({
			status: 404,
			body: { error: "not found" }
		});

		const response = await simulateRequestAsync({ url: "/no-such-url" });
		assert.deepEqual(response, expected);
	});

	it("fails fast if requests don't include request ID header", async () => {
		const expected = HttpResponse.createJsonResponse({
			status: 400,
			body: { error: "missing x-request-id header" },
		});

		const { response } = await routeAsync({ headers: {} });
		assert.deepEqual(response, expected);
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

function createRouter() {
	ensure.signature(arguments, []);

	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const router = Rot13Router.create(log);
	const requests = router._router.trackRequests();

	return { router, log, logOutput, requests };
}

async function routeAsync(requestOptions) {
	const { router, log, logOutput, requests } = createRouter();
	const request = createRequest(requestOptions);
	const response = await router.routeAsync(request);

	return { log, logOutput, requests, response };
}

async function controllerResponse(requestOptions) {
	const request = createRequest(requestOptions);
	return await Rot13Controller.create().postAsync(request);
}

async function simulateRequestAsync(requestOptions) {
	const request = createRequest(requestOptions);
	const { router } = createRouter();
	const server = HttpServer.createNull();

	await server.startAsync(IRRELEVANT_PORT, Log.createNull(), router);
	return await server.simulateRequestAsync(request);
}

function createRequest({
	url = VALID_URL,
	method = VALID_METHOD,
	headers = VALID_HEADERS,
	body = VALID_BODY,
} = {}) {
	return HttpRequest.createNull({ url, method, headers, body });
}

