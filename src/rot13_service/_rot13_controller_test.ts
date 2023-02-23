// Copyright Titanium I.T. LLC.
import assert from "util/assert.js";
import * as rot13Logic from "./rot13_logic.js";
import { Rot13Controller } from "./rot13_controller.js";
import { HttpServerRequest } from "http/http_server_request.js";
import * as rot13View from "./rot13_view.js";
import { HttpHeaders } from "http/http_headers.js";
import { HttpServerResponse } from "http/http_server_response.js";

const VALID_HEADERS = { "content-type": "application/json" };

function validBody(text: string): { text: string } {
	return { text };
}

describe("ROT-13 Controller", () => {

	describe("happy paths", () => {

		it("transforms requests", async () => {
			const { response } = await postAsync({
				headers: VALID_HEADERS,
				body: validBody("hello"),
			});
			assertOkResponse(response, "hello");
		});

		it("ignores extraneous fields", async () => {
			const body = { ignoreMe: "wrong field", text: "right field" };
			const { response } = await postAsync({ body });
			assertOkResponse(response, "right field");
		});

	});


	describe("failure paths", () => {

		it("returns 'bad request' when content-type header isn't JSON", async () => {
			const headers = { "content-type": "text/plain" };
			const { response } = await postAsync({ headers });
			assertBadRequest(response, "invalid content-type header");
		});

		it("returns 'bad request' when JSON fails to parse", async () => {
			const { response } = await postAsync({ body: "not-json" });
			assertBadRequest(response, "Unexpected token o in JSON at position 1");
		});

		it("returns 'bad request' when JSON doesn't have text field", async () => {
			const body = { wrongField: "foo" };
			const { response } = await postAsync({ body });
			assertBadRequest(response, "request.text must be a string, but it was undefined");
		});

	});

});


async function postAsync({
	headers = VALID_HEADERS,
	body = { text: "irrelevant-body" },
}: {
	headers?: HttpHeaders,
	body?: any,
} = {}) {
	if (typeof body === "object") body = JSON.stringify(body);

	const request = HttpServerRequest.createNull({ headers, body });
	const response = await Rot13Controller.create().postAsync(request);

	return { response };
}

function assertOkResponse(response: HttpServerResponse, originalText: string): void {
	const expectedResponse = rot13View.ok(rot13Logic.transform(originalText));

	assert.deepEqual(response, expectedResponse);
}

function assertBadRequest(response: HttpServerResponse, error: string): void {
	assert.deepEqual(response, rot13View.error(400, error));
}
