// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const rot13Logic = require("./rot13_logic");
const Rot13Controller = require("./rot13_controller");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");

const VALID_HEADERS = { "content-type": "application/json" };

function validBody(text) { return { text }; }

describe("ROT-13 Controller", () => {

	describe("happy paths", () => {

		it("transforms requests", async () => {
			const response = await simulateRequestAsync({
				headers: VALID_HEADERS,
				body: validBody("hello"),
			});
			assertOkResponse(response, "hello");
		});

		it("ignores extraneous fields", async () => {
			const body = { ignoreMe: "wrong field", text: "right field" };
			const response = await simulateRequestAsync({ body });
			assertOkResponse(response, "right field");
		});

	});


	describe("failure paths", () => {

		it("returns 'bad request' when content-type header isn't JSON", async () => {
			const headers = { "content-type": "text/plain" };
			const response = await simulateRequestAsync({ headers });
			assertBadRequest(response, "invalid content-type header");
		});

		it("returns 'bad request' when JSON fails to parse", async () => {
			const response = await simulateRequestAsync({ body: "not-json" });
			assertBadRequest(response, "Unexpected token o in JSON at position 1");
		});

		it("returns 'bad request' when JSON doesn't have text field", async () => {
			const body = { wrongField: "foo" };
			const response = await simulateRequestAsync({ body });
			assertBadRequest(response, "request.text must be a string, but it was undefined");
		});

	});

});


async function simulateRequestAsync({
	headers = VALID_HEADERS,
	body = { text: "irrelevant-body" },
} = {}) {
	if (typeof body === "object") body = JSON.stringify(body);

	const request = HttpRequest.createNull({ headers, body });
	return await Rot13Controller.create().postAsync(request);
}

function assertOkResponse(response, originalText) {
	const expectedResponse = HttpResponse.createJsonResponse({
		status: 200,
		body: { transformed: rot13Logic.transform(originalText) }
	});

	assert.deepEqual(response, expectedResponse);
}

function assertBadRequest(response, error) {
	assert.deepEqual(response, HttpResponse.createJsonResponse({
		status: 400,
		body: { error }
	}));
}
