// Copyright Titanium I.T. LLC.
import assert from "util/assert.js";
import * as ensure from "util/ensure.js";
import { HomePageController } from "./home_page/home_page_controller.js";
import { HttpServerRequest } from "http/http_server_request.js";
import { WwwRouter } from "./www_router.js";
import { WwwConfig } from "./www_config.js";
import * as wwwView from "./www_view.js";
import { HttpServer } from "http/http_server.js";
import { Log } from "infrastructure/log.js";
import { UuidGenerator } from "./infrastructure/uuid_generator.js";

const IRRELEVANT_PORT = 42;

const VALID_URL = "/";
const VALID_METHOD = "GET";

describe("WWW Router", () => {

	it("routes home page", async () => {
		const requestOptions = {
			url: VALID_URL,
			method: VALID_METHOD,
		};
		const request = HttpServerRequest.createNull(requestOptions);
		const expected = await HomePageController.createNull().getAsync(request, WwwConfig.createTestInstance());

		const { response } = await simulateHttpRequestAsync(requestOptions);
		assert.deepEqual(response, expected);
	});

	it("routes errors", async () => {
		const { response } = await simulateHttpRequestAsync({ url: "/no-such-url" });
		const expected = wwwView.errorPage(404, "not found");

		assert.deepEqual(response, expected);
	});

	it("configures requests", async () => {
		const { context } = await simulateHttpRequestAsync({
			port: 777,
			uuid: "my-uuid",
		});

		assert.equal(context.rot13ServicePort, 777, "port");
		assert.equal(context.correlationId, "my-uuid", "request ID");
		assert.deepEqual(context.log.defaults, { correlationId: "my-uuid" }, "log");
	});

	it("logs requests", async () => {
		const { logOutput } = await simulateHttpRequestAsync({
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

	it("has port for ROT-13 service and log", () => {
		const { router, log } = createRouter({ port: 777 });

		assert.equal(router.rot13ServicePort, 777, "port");
		assert.equal(router.log, log, "log");
	});

});

async function simulateHttpRequestAsync({
	port = IRRELEVANT_PORT,
	url = VALID_URL,
	method = VALID_METHOD,
	uuid = "irrelevant-uuid",
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		port: [ undefined, Number ],
		method: [ undefined, String ],
		url: [ undefined, String ],
		uuid: [ undefined, String ],
	}]]);

	const { router, log, logOutput } = createRouter({ port, uuid });
	const requests = router._router.trackRequests();

	const server = HttpServer.createNull();
	await server.startAsync(port, log, router);
	logOutput.clear();

	const request = HttpServerRequest.createNull({ url, method });
	const response = await server.simulateRequestAsync(request);
	const context = requests.data[0].context;

	return { response, logOutput, context };
}

function createRouter({
	port = IRRELEVANT_PORT,
	uuid = "irrelevant-uuid",
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		port: [ undefined, Number ],
		uuid: [ undefined, String ],
	}]]);

	const log = Log.createNull();
	const logOutput = log.trackOutput();

	const router = new WwwRouter(log, port, UuidGenerator.createNull(uuid), HomePageController.createNull());

	return { router, log, logOutput };
}
