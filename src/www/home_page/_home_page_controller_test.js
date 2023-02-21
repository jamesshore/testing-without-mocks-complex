// Copyright Titanium I.T. LLC.
import assert from "util/assert.cjs";
import ensure from "util/ensure.cjs";
import { HttpRequest } from "http/http_request.mjs";
import { WwwConfig } from "../www_config.js";
import * as homePageView from "./home_page_view.js";
import { Rot13Client } from "../infrastructure/rot13_client.js";
import { HomePageController } from "./home_page_controller.js";
import { Log } from "infrastructure/log.mjs";
import { Clock } from "infrastructure/clock.mjs";

const IRRELEVANT_PORT = 42;
const IRRELEVANT_INPUT = "irrelevant_input";
const IRRELEVANT_CORRELATION_ID = "irrelevant-correlation-id";

describe("Home Page Controller", () => {

	describe("happy paths", () => {

		it("GET renders home page", async () => {
			const { response } = await getAsync();
			assert.deepEqual(response, homePageView.homePage());
		});

		it("POST asks ROT-13 service to transform text", async () => {
			const { rot13Requests } = await postAsync({
				body: "text=my_text",
				rot13ServicePort: 9999,
				correlationId: "my-correlation-id",
			});

			assert.deepEqual(rot13Requests.data, [{
				text: "my_text",
				port: 9999,
				correlationId: "my-correlation-id",
			}]);
		});

		it("POST renders result of ROT-13 service call", async () => {
			const { response } = await postAsync({ rot13Response: "my_response" });
			assert.deepEqual(response, homePageView.homePage("my_response"));
		});

	});


	describe("parse edge cases", () => {

		it("finds correct form field when there are unrelated fields", async () => {
			const { rot13Requests } = await postAsync({
				body: "unrelated=one&text=two&also_unrelated=three",
			});

			assert.deepEqual(rot13Requests.data, [{
				text: "two",
				port: IRRELEVANT_PORT,
				correlationId: IRRELEVANT_CORRELATION_ID,
			}]);
		});

		it("logs warning when form field not found (and treats request like GET)", async () => {
			const { response, rot13Requests, logOutput } = await postAsync({
				body: "",
			});

			assert.deepEqual(logOutput.data, [{
				alert: Log.MONITOR,
				endpoint: "/",
				method: "POST",
				message: "form parse error",
				error: "'text' form field not found",
				body: "",
			}], "should log warning");

			assert.deepEqual(response, homePageView.homePage(), "should render home page");
			assert.deepEqual(rot13Requests.data, [], "shouldn't call ROT-13 service");
		});

		it("logs warning when duplicated form field found (and treats request like GET)", async () => {
			const { response, rot13Requests, logOutput } = await postAsync({
				body: "text=one&text=two",
			});

			assert.deepEqual(logOutput.data, [{
				alert: Log.MONITOR,
				endpoint: "/",
				method: "POST",
				message: "form parse error",
				error: "multiple 'text' form fields found",
				body: "text=one&text=two",
			}], "should log warning");

			assert.deepEqual(response, homePageView.homePage(), "should render home page");
			assert.deepEqual(rot13Requests.data, [], "shouldn't call ROT-13 service");
		});

	});


	describe("ROT-13 service edge cases", () => {

		it("fails gracefully, and logs error, when service returns error", async () => {
			const { response, logOutput } = await postAsync({ rot13ServicePort: 9999, rot13Error: "my_error" });

			assert.deepEqual(response, homePageView.homePage("ROT-13 service failed"), "should render error");

			assert.deepEqual(logOutput.data, [{
				alert: Log.EMERGENCY,
				endpoint: "/",
				method: "POST",
				message: "ROT-13 service error",
				error: "Error: Unexpected status from ROT-13 service\n" +
					"Host: localhost:9999\n" +
					"Endpoint: /rot13/transform\n" +
					"Status: 500\n" +
					"Headers: {}\n" +
					"Body: my_error",
			}], "should log error");
		});

		it("fails gracefully, cancels request, and logs error, when service responds too slowly", async () => {
			const { responsePromise, rot13Requests, logOutput, clock } = post({ rot13Hang: true });
			const response = await waitForRequestToTimeoutAsync(clock, responsePromise);

			assert.deepEqual(response, homePageView.homePage("ROT-13 service timed out"), "should render error");

			assert.deepEqual(rot13Requests.data, [
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
			], "should cancel request");

			assert.deepEqual(logOutput.data, [{
				alert: Log.EMERGENCY,
				endpoint: "/",
				method: "POST",
				message: "ROT-13 service timed out",
				timeoutInMs: 5000,
			}], "should log error");
		});
	});

});

async function getAsync() {
	ensure.signature(arguments, []);

	const controller = new HomePageController(Rot13Client.createNull(), Clock.createNull());
	const response = await controller.getAsync(HttpRequest.createNull(), WwwConfig.createTestInstance());

	return { response };
}

async function postAsync(options) {
	const { responsePromise, ...remainder } = post(options);

	return {
		response: await responsePromise,
		...remainder,
	};
}

function post({
	body = `text=${IRRELEVANT_INPUT}`,
	correlationId = IRRELEVANT_CORRELATION_ID,
	rot13ServicePort = IRRELEVANT_PORT,
	rot13Response = "irrelevant_response",
	rot13Error = undefined,
	rot13Hang = false,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		body: [ undefined, String ],
		correlationId: [ undefined, String ],
		rot13ServicePort: [ undefined, Number ],
		rot13Response: [ undefined, String ],
		rot13Error: [ undefined, String ],
		rot13Hang: [ undefined, Boolean ],
	}]]);

	const rot13Client = Rot13Client.createNull([{ response: rot13Response, error: rot13Error, hang: rot13Hang }]);
	const rot13Requests = rot13Client.trackRequests();

	const log = Log.createNull();
	const logOutput = log.trackOutput();

	const clock = Clock.createNull();
	const request = HttpRequest.createNull({ body });
	const config = WwwConfig.createTestInstance({ rot13ServicePort, log, correlationId });

	const controller = new HomePageController(rot13Client, clock);
	const responsePromise = controller.postAsync(request, config);

	return {
		responsePromise,
		rot13Requests,
		logOutput,
		clock,
	};
}

async function waitForRequestToTimeoutAsync(clock, responsePromise) {
	await clock.advanceNulledClockUntilTimersExpireAsync();
	return await responsePromise;
}
