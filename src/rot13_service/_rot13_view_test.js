// Copyright Titanium I.T. LLC.
import assert from "util/assert.cjs";
import * as rot13View from "./rot13_view.js";
import { HttpResponse } from "http/http_response.mjs";

describe("ROT-13 View", () => {

	it("has success response", () => {
		const expected = HttpResponse.createJsonResponse({
			status: 200,
			body: { transformed: "response" }
		});

		assert.deepEqual(rot13View.ok("response"), expected);
	});

	it("has error response", () => {
		const expected = HttpResponse.createJsonResponse({
			status: 404,
			body: { error: "not found" }
		});

		assert.deepEqual(rot13View.error(404, "not found"), expected);
	});

});

