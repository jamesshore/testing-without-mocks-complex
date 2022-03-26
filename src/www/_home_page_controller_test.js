// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");
const wwwView = require("./www_view");

describe("Home Page Controller", () => {

	describe("happy paths", () => {

		it("GET renders home page", async () => {
			const response = await simulateGetAsync();
			assert.deepEqual(response, wwwView.homePage());
		});

		it("Temp: POST renders input", async () => {
			const response = await simulatePostAsync("text=something");
			assert.deepEqual(response, wwwView.homePage("something"));
		});

		it.skip("POST asks ROT-13 service to transform text, then renders result", async () => {
			// TODO
			const response = await simulatePostAsync("text=hello");
			assert.deepEqual(response, wwwView.homePage("uryyb"));
		});

	});


	describe.skip("POST edge cases (TO DO)", () => {

		it("POST finds correct form field when there are multiple fields", async () => {
			const response = await simulatePostAsync("");
		});

		it("POST treats empty input like GET", async () => {
			const response = await simulatePostAsync("");
			assert.deepEqual(response, wwwView.homePage());
		});

		it("POST treats parse errors like GET, but logs a warning");

		it("POST treats incorrect form data like GET, but logs a warning");

	});

});

async function simulateGetAsync() {
	ensure.signature(arguments, []);
	return await simulateRequestAsync({ method: "get" });
}

async function simulatePostAsync(body) {
	ensure.signature(arguments, [ String ]);
	return await simulateRequestAsync({ method: "post", body });
}

async function simulateRequestAsync({
	method = "get",
	body = "",
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		method: [ undefined, String ],
		body: [ undefined, String ],
	}]]);

	const request = HttpRequest.createNull({ method, body, url: "/" });
	return await WwwRouter.create().routeAsync(request);
}
