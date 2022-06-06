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
const PARSE_LOG_BOILERPLATE = {
	alert: Log.MONITOR,
	message: "form parse error in POST /",
};

describe("Home Page Controller", () => {

	describe("happy paths", () => {

		it("GET renders home page", async () => {
		});

		it("POST asks ROT-13 service to transform text", async () => {
		});

		it("POST renders result of ROT-13 service call", async() => {
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
