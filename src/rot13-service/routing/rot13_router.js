// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13Response = require("./rot13_response");
const rot13 = require("../logic/rot13");
const HttpRequest = require("../infrastructure/http_request");
const Clock = require("infrastructure/clock");

const REQUEST_TYPE = { text: String };

// when the timestamp is odd, we delay before returning the response.
const DELAY_IN_MS = 30000;

/** Top-level router for ROT-13 service */
exports.routeAsync = async function(request, clock) {
	ensure.signature(arguments, [ HttpRequest, Clock ]);

	if (request.urlPathname !== "/rot13/transform") return rot13Response.notFound();
	if (request.method !== "POST") return rot13Response.methodNotAllowed();
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

	if (timestampIsOdd(clock)) {
		await clock.waitAsync(DELAY_IN_MS);
	}

	const input = json.text;
	const output = rot13.transform(input);
	return rot13Response.ok(output);
};

function timestampIsOdd(clock) {
	return (clock.now() % 2 === 1);
}