// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13 = require("../logic/rot13");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");

const REQUEST_TYPE = { text: String };

exports.postAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	try {
		const input = await parseRequestAsync(request);
		const output = rot13.transform(input);
		return ok(output);
	}
	catch (err) {
		return badRequest(err.message);
	}
};

async function parseRequestAsync(request) {
	if (!request.hasContentType("application/json")) throw new Error("invalid content-type header");

	const json = JSON.parse(await request.readBodyAsync());
	ensure.typeMinimum(json, REQUEST_TYPE, "request");

	return json.text;
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