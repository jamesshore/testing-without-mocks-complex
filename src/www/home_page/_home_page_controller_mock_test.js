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
const td = require("testdouble");

const IRRELEVANT_PORT = 42;
const PARSE_LOG_BOILERPLATE = {
	alert: Log.MONITOR,
	message: "form parse error in POST /",
};

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
			const { rot13Client } = await postAsync({
				body: "text=my+text",
				rot13Port: 999
			});
			td.verify(rot13Client.transformAsync(999, "my text"));
		});

		it("POST renders result of ROT-13 service call", async() => {
			const { response } = await postAsync({
				body: "text=hello%20world",
				rot13Input: "hello world",
				rot13Response: "my_response"
			});
			assert.deepEqual(response, homePageView.homePage("my_response"));
		});

	});


	describe("parse edge cases", () => {

		it("finds correct form field when there are unrelated fields", async () => {
			const { response } = await postAsync({
				body: "unrelated=one&text=two&also_unrelated=three",
				rot13Input: "two",
				rot13Response: "my response"
			});
			assert.deepEqual(response, homePageView.homePage("my response"));
		});

		it("logs warning when form field not found (and treats request like GET)", async () => {
			const { response, rot13Client, log } = await postAsync({
				body: ""
			});

			assert.deepEqual(response, homePageView.homePage());
			td.verify(rot13Client.transformAsync(), { times: 0, ignoreExtraArgs: true });
			td.verify(log.monitor({
				message: "form parse error in POST /",
				details: "'text' form field not found",
				body: "",
			}));
		});


		it("logs warning when duplicated form field found (and treats request like GET)", async () => {
		});

	});


	describe("ROT-13 service edge cases", () => {

		it("fails gracefully, and logs error, when service returns error", async () => {
		});

		it("fails gracefully, cancels request, and logs error, when service responds too slowly", async () => {
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
	const response = controller.getAsync(request, config);

	return { response };
}

async function postAsync({
	body = "text=irrelevant_body",
	rot13Port = 42,
	rot13Input = "irrelevant ROT-13 input",
	rot13Response = "irrelevant ROT-13 response",
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		body: [ undefined, String ],
		rot13Port: [ undefined, Number ],
		rot13Input: [ undefined, String ],
		rot13Response: [ undefined, String ],
	}]]);

	const rot13Client = td.instance(Rot13Client);
	const clock = td.instance(Clock);
	const request = td.instance(HttpRequest);
	const config = td.instance(WwwConfig);
	const log = td.object(new Log());

	config.rot13ServicePort = rot13Port;
	config.log = log;
	td.when(request.readBodyAsync()).thenResolve(body);
	td.when(rot13Client.transformAsync(rot13Port, rot13Input)).thenResolve(rot13Response);

	const controller = new HomePageController(rot13Client, clock);
	const response = await controller.postAsync(request, config);

	return {
		response,
		rot13Client,
		log,
	};

}
