// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13Logic = require("./rot13_logic");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");

const REQUEST_TYPE = { text: String };

exports.postAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	const { input, err } = await parseRequestAsync(request);
	if (err !== undefined) return badRequest(err.message);

	const output = rot13Logic.transform(input);
	return ok(output);
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

function ok(output) {
	return HttpResponse.createJsonResponse({
		status: 200,
		body: { transformed: output },
	});
}

function badRequest(error) {
	return HttpResponse.createJsonResponse({
		status: 400,
		body: { error }
	});
}