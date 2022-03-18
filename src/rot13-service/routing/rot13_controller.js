// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13 = require("../logic/rot13");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");

const REQUEST_TYPE = { text: String };

exports.postAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	if (!request.hasContentType("application/json")) {
		return badRequest("invalid content-type header");
	}
	const jsonString = await request.readBodyAsync();
	let json;
	try {
		json = JSON.parse(jsonString);
		ensure.typeMinimum(json, REQUEST_TYPE, "request");
	}
	catch(err) {
		return badRequest(err.message);
	}

	const input = json.text;
	const output = rot13.transform(input);
	return ok(output);
};

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