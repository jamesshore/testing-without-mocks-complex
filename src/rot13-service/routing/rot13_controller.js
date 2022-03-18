// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const rot13Response = require("./rot13_response");
const rot13 = require("../logic/rot13");

const REQUEST_TYPE = { text: String };

exports.postAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	if (!request.hasContentType("application/json")) {
		return rot13Response.badRequest("invalid content-type header");
	}
	const jsonString = await request.readBodyAsync();
	let json;
	try {
		json = JSON.parse(jsonString);
		ensure.typeMinimum(json, REQUEST_TYPE, "request");
	}
	catch(err) {
		return rot13Response.badRequest(err.message);
	}

	const input = json.text;
	const output = rot13.transform(input);
	return rot13Response.ok(output);
};