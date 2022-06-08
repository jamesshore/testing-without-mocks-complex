// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const td = require("testdouble");
const HttpRequest = require("http/http_request");
const WwwConfig = require("../www_config");
const homePageView = require("./home_page_view");
const Rot13Client = require("../infrastructure/rot13_client");
const HomePageController = require("./home_page_controller");
const Log = require("infrastructure/log");
const Clock = require("infrastructure/clock");

const IRRELEVANT_PORT = 42;
const IRRELEVANT_INPUT = "irrelevant_input";

describe("Home Page Controller", () => {

	afterEach(() => {
		td.reset();
	});

	describe("happy paths", () => {

		it("GET renders home page", async () => {
			const { response } = await getAsync();
			assert.deepEqual(response, homePageView.homePage());
		});

		it("POST asks ROT-13 service to transform text", async () => {
			const { rot13Client } = await simulatePostAsync({
				body: "text=my+text",
				rot13Port: 999
			});

			td.verify(rot13Client.transform(999, "my text"));
		});

		it("POST renders result of ROT-13 service call", async() => {
			const { response } = await simulatePostAsync({
				rot13Response: "my_response"
			});

			assert.deepEqual(response, homePageView.homePage("my_response"));
		});

	});


	describe("parse edge cases", () => {

		it("finds correct form field when there are unrelated fields", async () => {
			const { rot13Client } = await simulatePostAsync({
				body: "unrelated=one&text=two&also_unrelated=three",
			});

			td.verify(rot13Client.transform(IRRELEVANT_PORT, "two"));
		});

		it("logs warning when form field not found (and treats request like GET)", async () => {
			const { response, rot13Client, log } = await simulatePostAsync({
				body: ""
			});

			assert.deepEqual(response, homePageView.homePage());
			td.verify(rot13Client.transform(), { times: 0, ignoreExtraArgs: true });
			td.verify(log.monitor({
				message: "form parse error in POST /",
				details: "'text' form field not found",
				body: "",
			}));
		});


		it("logs warning when duplicated form field found (and treats request like GET)", async () => {
			const { response, rot13Client, log } = await simulatePostAsync({
				body: "text=one&text=two"
			});

			assert.deepEqual(response, homePageView.homePage());
			td.verify(rot13Client.transform(), { times: 0, ignoreExtraArgs: true });
			td.verify(log.monitor({
				message: "form parse error in POST /",
				details: "multiple 'text' form fields found",
				body: "text=one&text=two",
			}));
		});

	});


	describe("ROT-13 service edge cases", () => {

		it("fails gracefully, and logs error, when service returns error", async () => {
			const rot13Error = new Error("my_error");
			const { response, log } = await simulatePostAsync({
				rot13Error,
			});

			assert.deepEqual(response, homePageView.homePage("ROT-13 service failed"));
			td.verify(log.emergency({
				message: "ROT-13 service error in POST /",
				error: rot13Error,
			}));
		});

		it("fails gracefully, cancels request, and logs error, when service responds too slowly", async () => {
			const { responsePromise, clock, log, cancelFn } = await simulatePost({
				rot13Hang: true,
			});

			await clock.advanceNullTimersAsync();
			const response = await responsePromise;

			assert.deepEqual(response, homePageView.homePage("ROT-13 service timed out"));
			td.verify(cancelFn());
			td.verify(log.emergency({
				message: "ROT-13 service timed out in POST /",
				timeoutInMs: 5000,
			}));
		});

	});

});

async function getAsync() {
	ensure.signature(arguments, []);

	const rot13Client = td.instance(Rot13Client);
	const clock = td.instance(Clock);
	const request = td.instance(HttpRequest);
	const config = td.instance(WwwConfig);

	const controller = new HomePageController(rot13Client, clock);
	const response = await controller.getAsync(request, config);

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
	rot13Port = IRRELEVANT_PORT,
	rot13Input = IRRELEVANT_INPUT,
	rot13Response = "irrelevant ROT-13 response",
	rot13Hang = false,
	rot13Error,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		body: [ undefined, String ],
		rot13Port: [ undefined, Number ],
		rot13Input: [ undefined, String ],
		rot13Response: [ undefined, String ],
		rot13Hang: [ undefined, Boolean ],
		rot13Error: [ undefined, Error ],
	}]]);

	const rot13Client = td.instance(Rot13Client);
	const clock = Clock.createNull();
	const request = td.instance(HttpRequest);
	const log = td.object(new Log());
	const config = td.instance(WwwConfig);
	const cancelFn = td.function();

	config.rot13ServicePort = rot13Port;
	config.log = log;
	td.when(request.readBodyAsync()).thenResolve(body);

	if (rot13Error !== undefined) {
		td.when(rot13Client.transform(rot13Port, rot13Input)).thenReturn({
			transformPromise: Promise.reject(rot13Error),
			cancelFn,
		});
	}
	else if (rot13Hang) {
		td.when(rot13Client.transform(rot13Port, rot13Input)).thenReturn({
			transformPromise: new Promise(() => {}),
			cancelFn,
		});
	}
	else {
		td.when(rot13Client.transform(rot13Port, rot13Input)).thenReturn({
			transformPromise: Promise.resolve(rot13Response),
			cancelFn,
		});
	}

	const controller = new HomePageController(rot13Client, clock);
	const responsePromise = controller.postAsync(request, config);

	return {
		responsePromise,
		rot13Client,
		clock,
		log,
		cancelFn,
	};

}
