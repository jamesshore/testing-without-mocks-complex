// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13Response = require("./rot13_response");
const rot13 = require("../logic/rot13");
const HttpRequest = require("http/http_request");

const REQUEST_TYPE = { text: String };

/** Top-level router for ROT-13 service */
exports.routeAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	if (request.urlPathname !== "/rot13/transform") return rot13Response.error(404, "not found");
	if (request.method !== "POST") return rot13Response.error(405, "method not allowed");

	if (!request.hasContentType("application/json")) return rot13Response.badRequest("invalid content-type header");
	const jsonString = await request.readBodyAsync();
	let json;
	try {
		json = JSON.parse(jsonString);
		ensure.typeMinimum(json, REQUEST_TYPE, "request");
	}
	catch (err) {
		return rot13Response.badRequest(err.message);
	}

	const input = json.text;
	const output = rot13.transform(input);
	return rot13Response.ok(output);
};
