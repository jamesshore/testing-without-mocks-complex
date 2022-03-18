// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpRequest = require("http/http_request");
const wwwController = require("./www_controller");
const wwwView = require("./www_view");

describe("WWW Controller", () => {

	describe("happy paths", () => {

		it("'GET /' renders home page", async () => {
			const response = await simulateRequestAsync();
			assert.deepEqual(response, wwwView.homePage());
		});

	});

});


async function simulateRequestAsync() {
	return await wwwController.getAsync();
}
