// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const WwwConfig = require("../www_config");
const homePageView = require("./home_page_view");
const Rot13Client = require("../infrastructure/rot13_client");
const HomePageController = require("./home_page_controller");
const Log = require("infrastructure/log");
const Clock = require("infrastructure/clock");

const IRRELEVANT_PORT = 42;
const IRRELEVANT_INPUT = "irrelevant_input";
const IRRELEVANT_CORRELATION_ID = "irrelevant-correlation-id";

describe("Home Page Controller", () => {

	describe("happy paths", () => {

		it("GET renders home page", async () => {
			const { response } = await simulateGetAsync();
			assert.deepEqual(response, homePageView.homePage());
		});

		it("POST asks ROT-13 service to transform text", async () => {
			const { rot13Requests } = await simulatePostAsync({
				body: "text=my_text",
				rot13Port: 9999,
				correlationId: "my-correlation-id",
			});

			assert.deepEqual(rot13Requests, [{
				port: 9999,       // should match config
				text: "my_text",  // should match post body
				correlationId: "my-correlation-id",
			}]);
		});

		it("POST renders result of ROT-13 service call", async () => {
			const rot13Client = Rot13Client.createNull([ { response: "my_response" } ]);
			const { response } = await simulatePostAsync({ body: "text=my_text", rot13Client });

			assert.deepEqual(response, homePageView.homePage("my_response"));
		});

	});


	describe("parse edge cases", () => {

		it("finds correct form field when there are unrelated fields", async () => {
			const { rot13Requests } = await simulatePostAsync({
				body: "unrelated=one&text=two&also_unrelated=three",
			});

			assert.deepEqual(rot13Requests, [
				{
					text: "two",
					port: IRRELEVANT_PORT,
					correlationId: IRRELEVANT_CORRELATION_ID,
				},
			]);
		});

		it("logs warning when form field not found (and treats request like GET)", async () => {
			const { response, rot13Requests, logOutput } = await simulatePostAsync({
				body: "",
			});

			assert.deepEqual(response, homePageView.homePage());
			assert.deepEqual(rot13Requests, []);
			assert.deepEqual(logOutput, [
				{
					alert: Log.MONITOR,
					message: "form parse error in POST /",
					details: "'text' form field not found",
					body: "",
				},
			]);
		});

		it("logs warning when duplicated form field found (and treats request like GET)", async () => {
			const { response, rot13Requests, logOutput } = await simulatePostAsync({
				body: "text=one&text=two",
			});

			assert.deepEqual(response, homePageView.homePage());
			assert.deepEqual(rot13Requests, []);
			assert.deepEqual(logOutput, [
				{
					alert: Log.MONITOR,
					message: "form parse error in POST /",
					details: "multiple 'text' form fields found",
					body: "text=one&text=two",
				},
			]);
		});

	});


	describe("ROT-13 service edge cases", () => {

		it("fails gracefully, and logs error, when service returns error", async () => {
			const rot13Client = Rot13Client.createNull([ { error: "my_error" } ]);
			const { response, logOutput } = await simulatePostAsync({ rot13Client, rot13Port: 9999 });

			assert.deepEqual(response, homePageView.homePage("ROT-13 service failed"));
			assert.deepEqual(logOutput, [
				{
					alert: Log.EMERGENCY,
					message: "ROT-13 service error in POST /",
					error: "Error: " + Rot13Client.nullErrorString(9999, "my_error"),
				},
			]);
		});

		it("fails gracefully, cancels request, and logs error, when service responds too slowly", async () => {
			const rot13Client = Rot13Client.createNull([ { hang: true } ]);
			const { responsePromise, rot13Requests, logOutput, clock } = simulatePost({
				rot13Client,
			});

			await clock.advanceNullTimersAsync();
			const response = await responsePromise;

			assert.deepEqual(response, homePageView.homePage("ROT-13 service timed out"), "graceful failure");
			assert.deepEqual(rot13Requests, [
				{
					port: IRRELEVANT_PORT,
					text: IRRELEVANT_INPUT,
					correlationId: IRRELEVANT_CORRELATION_ID,
				}, {
					cancelled: true,
					port: IRRELEVANT_PORT,
					text: IRRELEVANT_INPUT,
					correlationId: IRRELEVANT_CORRELATION_ID,
				},
			]);
			assert.deepEqual(logOutput, [
				{
					alert: Log.EMERGENCY,
					message: "ROT-13 service timed out in POST /",
					timeoutInMs: 5000,
				},
			]);
		});

	});

});

async function simulateGetAsync() {
	ensure.signature(arguments, []);

	const controller = HomePageController.createNull();
	const response = await controller.getAsync(HttpRequest.createNull(), WwwConfig.createTestInstance());

	return { response };
}

async function simulatePostAsync(options) {
	const { responsePromise, ...remainder } = simulatePost(options);

	return {
		response: await responsePromise,
		...remainder,
	};
}

function simulatePost({
	body = `text=${IRRELEVANT_INPUT}`,
	rot13Client = Rot13Client.createNull(),
	rot13Port = IRRELEVANT_PORT,
	correlationId = IRRELEVANT_CORRELATION_ID,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		body: [ undefined, String ],
		rot13Client: [ undefined, Rot13Client ],
		rot13Port: [ undefined, Number ],
		correlationId: [ undefined, String ],
	}]]);

	const rot13Requests = rot13Client.trackRequests();
	const clock = Clock.createNull();
	const request = HttpRequest.createNull({ body });
	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const config = WwwConfig.createTestInstance({ rot13ServicePort: rot13Port, log, correlationId });

	const controller = HomePageController.createNull({ rot13Client, clock });
	const responsePromise = controller.postAsync(request, config);

	return {
		responsePromise,
		rot13Requests: rot13Requests.data,
		logOutput: logOutput.data,
		clock,
	};
}
