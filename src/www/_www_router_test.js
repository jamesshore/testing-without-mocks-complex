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
const UuidGenerator = require("./infrastructure/uuid_generator");

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

	it("adds UUID to request log", async () => {
		const log = Log.createNull();
		const logOutput = log.trackOutput();
		const uuids = UuidGenerator.createNull([ "uuid-1", "uuid-2", "uuid-3" ]);

		await routeAsync({ log, uuids });
		await routeAsync({ log, uuids });
		await routeAsync({ log, uuids });

		assert.deepEqual(logOutput.data[0].correlationId, "uuid-1");
		assert.deepEqual(logOutput.data[1].correlationId, "uuid-2");
		assert.deepEqual(logOutput.data[2].correlationId, "uuid-3");
	});

	it("provides configuration to requests", async () => {
		const uuids = UuidGenerator.createNull("my-uuid");

		const { log, requests } = await routeAsync({ port: 777, uuids });
		const config = requests.data[0].config;

		assert.equal(config.rot13ServicePort, 777, "port");
		assert.equal(config.correlationId, "my-uuid", "request ID");
		assert.isTrue(config.log.equals(log.bind({ correlationId: "my-uuid" })), "log defaults");
	});

	it("provides log and port", () => {
		const { router, log } = createRouter({ port: 777 });

		assert.equal(router.log, log, "log");
		assert.equal(router.rot13ServicePort, 777, "port");
	});

});

function createRouter({
	port = IRRELEVANT_PORT,
	log = Log.createNull(),
	uuids = UuidGenerator.createNull(),
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		port: [ undefined, Number ],
		log: [ undefined, Log ],
		uuids: [ undefined, UuidGenerator ],
	}]]);

	const logOutput = log.trackOutput();
	const router = new WwwRouter(log, port, uuids);
	const requests = router._router.trackRequests();

	return { router, log, logOutput, requests };
}

async function routeAsync({
	port,
	log,
	uuids,
	url,
	method,
} = {}) {
	ensure.signatureMinimum(arguments, [[ undefined, {
		port: [ undefined, Number ],
		log: [ undefined, Log ],
		uuids: [ undefined, UuidGenerator ],
		url: [ undefined, String ],
		method: [ undefined, String ],
	}]]);

	const { router, log: aLog, logOutput, requests } = createRouter({ port, log, uuids });
	const request = createRequest({ url, method });
	const response = await router.routeAsync(request);

	return { logOutput, log: aLog, requests, response };
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

