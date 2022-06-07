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
			const rot13Client = td.instance(Rot13Client);
			const clock = td.instance(Clock);
			const request = td.instance(HttpRequest);
			const config = td.instance(WwwConfig);

			const controller = new HomePageController(rot13Client, clock);
			const response = controller.getAsync(request, config);
			assert.deepEqual(response, homePageView.homePage());
		});

		it("POST asks ROT-13 service to transform text", async () => {
			const rot13Client = td.instance(Rot13Client);
			const clock = td.instance(Clock);
			const request = td.instance(HttpRequest);
			const config = td.instance(WwwConfig);

			config.rot13ServicePort = 777;
			td.when(request.readBodyAsync()).thenResolve("text=my+text");

			const controller = new HomePageController(rot13Client, clock);
			await controller.postAsync(request, config);
			td.verify(rot13Client.transformAsync(777, "my text"));
		});

		it("POST renders result of ROT-13 service call", async() => {
			const rot13Client = td.instance(Rot13Client);
			const clock = td.instance(Clock);
			const request = td.instance(HttpRequest);
			const config = td.instance(WwwConfig);

			config.rot13ServicePort = 777;
			td.when(request.readBodyAsync()).thenResolve("text=my+text");
			td.when(rot13Client.transformAsync(777, "my text")).thenResolve("my response");

			const controller = new HomePageController(rot13Client, clock);
			const result = await controller.postAsync(request, config);
			assert.deepEqual(result, homePageView.homePage("my response"));
		});

	});


	describe("parse edge cases", () => {

		it("finds correct form field when there are unrelated fields", async () => {
		});

		it("logs warning when form field not found (and treats request like GET)", async () => {
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
