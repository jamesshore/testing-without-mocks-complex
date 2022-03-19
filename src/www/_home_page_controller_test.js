// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpRequest = require("http/http_request");
const wwwController = require("./home_page_controller");
const wwwView = require("./www_view");

describe("Home Page Controller", () => {

	describe("happy paths", () => {

		it("renders home page", async () => {
			const response = await simulateRequestAsync();
			assert.deepEqual(response, wwwView.homePage());
		});

	});

});


async function simulateRequestAsync() {
	return await wwwController.getAsync();
}
