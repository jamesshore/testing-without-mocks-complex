// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const assert = require("util/assert");
const Rot13Router = require("./rot13_router.cjs");
const HttpServer = require("http/http_server");
const HttpRequest = require("http/http_request");
const Rot13Controller = require("./rot13_controller.cjs");
const HttpResponse = require("http/http_response");
const Log = require("infrastructure/log");
const rot13View = require("./rot13_view.cjs");

const IRRELEVANT_PORT = 42;

const VALID_URL = "/rot13/transform";
const VALID_METHOD = "POST";
const VALID_HEADERS = {
	"content-type": "application/json",
	"x-correlation-id": "irrelevant-correlation-id",
};
const VALID_BODY = JSON.stringify({ text: "irrelevant_text" });

describe("ROT-13 Router", () => {

	it("routes transform endpoint", async () => {
		const requestOptions = {
			url: VALID_URL,
			method: VALID_METHOD,
			headers: VALID_HEADERS,
			body: VALID_BODY,
		};
		const expected = await Rot13Controller.create().postAsync(HttpRequest.createNull(requestOptions));

		const { response } = await simulateHttpRequestAsync(requestOptions);
		assert.deepEqual(response, expected);
	});

	it("returns JSON errors", async () => {
		const { response } = await simulateHttpRequestAsync({ url: "/no-such-url" });
		assert.deepEqual(response, rot13View.error(404, "not found"));
	});

	it("fails fast if requests don't include request ID header", async () => {
		const expected = HttpResponse.createJsonResponse({
			status: 400,
			body: { error: "missing x-correlation-id header" },
		});

		const { response } = await simulateHttpRequestAsync({ headers: {} });
		assert.deepEqual(response, expected);
	});

	it("logs requests", async () => {
		const { logOutput } = await simulateHttpRequestAsync({
			method: "get",
			url: "/my_url",
			headers: { "x-correlation-id": "my-correlation-id" },
		});

		assert.deepEqual(logOutput.data, [{
			alert: "info",
			correlationId: "my-correlation-id",
			message: "request",
			method: "get",
			path: "/my_url",
		}]);
	});

});

async function simulateHttpRequestAsync({
	url = VALID_URL,
	method = VALID_METHOD,
	headers = VALID_HEADERS,
	body = VALID_BODY,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		url: [ undefined, String ],
		method: [ undefined, String ],
		headers: [ undefined, Object ],
		body : [ undefined, String ],
	}]]);

	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const router = new Rot13Router(log);

	const request = HttpRequest.createNull({ url, method, headers, body });

	const server = HttpServer.createNull();
	await server.startAsync(IRRELEVANT_PORT, Log.createNull(), router);

	const response = await server.simulateRequestAsync(request);

	return { response, logOutput };
}

