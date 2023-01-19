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

	it("has log and ROT-13 service port", () => {
		const log = Log.createNull();
		const { router } = createRouter({ port: 777, log });

		assert.equal(router.log, log, "log");
		assert.equal(router.rot13ServicePort, 777, "port");
	});

	it("routes home page", async () => {
		const { request, response } = await simulateHttpRequestAsync({
			url: VALID_URL,
			method: VALID_METHOD,
		});
		const expected = await HomePageController.createNull().getAsync(request, WwwConfig.createNull());

		assert.deepEqual(response, expected);
	});

	it("routes errors", async () => {
		const { response } = await simulateHttpRequestAsync({ url: "/no-such-url" });
		const expected = wwwView.errorPage(404, "not found");

		assert.deepEqual(response, expected);
	});

	it("configures requests", async () => {
		const { config } = await routeAsync({
			port: 777,
			uuid: "my-uuid",
		});

		assert.equal(config.rot13ServicePort, 777, "port");
		assert.equal(config.correlationId, "my-uuid", "request ID");
		assert.deepEqual(config.log.defaults, { correlationId: "my-uuid" }, "log");
	});

	it("logs requests", async () => {
		const { logOutput } = await routeAsync({
			method: "get",
			url: "/my_url",
			uuid: "my-uuid",
		});

		assert.deepEqual(logOutput.data, [{
			alert: "info",
			correlationId: "my-uuid",
			message: "request",
			method: "get",
			path: "/my_url",
		}]);
	});

});

async function simulateHttpRequestAsync({
	url = VALID_URL,
	method = VALID_METHOD,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		url: [ undefined, String ],
		method: [ undefined, String ],
	}]]);

	const log = Log.createNull();
	const request = HttpRequest.createNull({ url, method });
	const { router } = createRouter({ log });
	const server = HttpServer.createNull();

	await server.startAsync(IRRELEVANT_PORT, log, router);
	const response = await server.simulateRequestAsync(request);

	return { request, response };
}

async function routeAsync({
	port = IRRELEVANT_PORT,
	method = VALID_METHOD,
	url = VALID_URL,
	uuid = "irrelevant-uuid",
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		port: [ undefined, Number ],
		method: [ undefined, String ],
		url: [ undefined, String ],
		uuid: [ undefined, String ],
	}]]);

	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const { router, requests } = createRouter({ port, log, uuid });
	const request = HttpRequest.createNull({ method, url });
	const response = await router.routeAsync(request);
	const config = requests.data[0].config;

	return { logOutput, response, config };
}

function createRouter({
	port = IRRELEVANT_PORT,
	log = Log.createNull(),
	uuid = "irrelevant-uuid",
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		port: [ undefined, Number ],
		log: [ undefined, Log ],
		uuid: [ undefined, String ],
	}]]);

	const router = new WwwRouter(log, port, UuidGenerator.createNull(uuid));
	const requests = router._router.trackRequests();

	return { router, requests };
}
