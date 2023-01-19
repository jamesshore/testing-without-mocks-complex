// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13Logic = require("./rot13_logic");
const HttpResponse = require("http/http_response");
const rot13View = require("./rot13_view");

const REQUEST_TYPE = { text: String };

/** Endpoint for /rot13/transform */
module.exports = class Rot13Controller {

	static create() {
		return new Rot13Controller();
	}

	async postAsync(request) {
		const { input, err } = await parseRequestAsync(request);
		if (err !== undefined) return rot13View.error(400, err.message);

		const output = rot13Logic.transform(input);
		return rot13View.ok(output);
	}

};

async function parseRequestAsync(request) {
	try {
		if (!request.hasContentType("application/json")) throw new Error("invalid content-type header");

		const json = JSON.parse(await request.readBodyAsync());
		ensure.typeMinimum(json, REQUEST_TYPE, "request");

		return { input: json.text };
	}
	catch (err) {
		return { err };
	}
}
