// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const WwwConfig = require("./www_config");
const wwwView = require("./www_view");
const Rot13Client = require("./infrastructure/rot13_client");
const HomePageController = require("./home_page_controller");

describe("Home Page Controller", () => {

	describe("happy paths", () => {

		it("GET renders home page", async () => {
			const response = await simulateGetAsync();
			assert.deepEqual(response, wwwView.homePage());
		});

		it("POST asks ROT-13 service to transform text, then renders result", async () => {
			const rot13Client = Rot13Client.createNull([{ response: "my_response" }]);
			const rot13Requests = rot13Client.trackRequests();
			const wwwConfig = WwwConfig.createNull({ rot13ServicePort: 9999 });

			const response = await simulatePostAsync({ body: "text=my_text", rot13Client, wwwConfig });

			assert.deepEqual(rot13Requests, [{
				port: 9999,       // should match config
				text: "my_text",  // should match post body
			}], "ROT-13 service requests");
			assert.deepEqual(response, wwwView.homePage("my_response"), "home page rendering");
		});

	});


	describe.skip("POST edge cases (TO DO)", () => {

		it("POST finds correct form field when there are multiple fields", async () => {
			const response = await simulatePostAsync({ body: "TO DO" });
		});

		it("POST treats empty input like GET", async () => {
			const response = await simulatePostAsync({ body: "" });
			assert.deepEqual(response, wwwView.homePage());
		});

		it("POST treats parse errors like GET, but logs a warning");

		it("POST treats incorrect form data like GET, but logs a warning");

	});


	describe.skip("ROT-13 service edge cases (TO DO)", () => {

		it("fails gracefully, and logs error, when service returns error");

		it("fails gracefully, and logs error, when service times out");

	});

});

async function simulateGetAsync() {
	ensure.signature(arguments, []);

	const controller = HomePageController.createNull();
	return await controller.getAsync(HttpRequest.createNull(), WwwConfig.createNull());
}

async function simulatePostAsync({
	body,
	rot13Client = Rot13Client.createNull(),
	wwwConfig = WwwConfig.createNull(),
}) {
	ensure.signature(arguments, [{
		body: String,
		rot13Client: [ undefined, Rot13Client ],
		wwwConfig: [ undefined, WwwConfig ],
	}]);

	const controller = HomePageController.createNull({ rot13Client });
	const request = HttpRequest.createNull({ body });
	const response = await controller.postAsync(request, wwwConfig);
	return response;
}
