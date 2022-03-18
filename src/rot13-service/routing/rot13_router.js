// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const rot13Response = require("./rot13_response");
const HttpRequest = require("http/http_request");
const rot13Controller = require("./rot13_controller");

/** Top-level router for ROT-13 service */
exports.routeAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	if (request.urlPathname !== "/rot13/transform") return rot13Response.error(404, "not found");
	if (request.method !== "POST") return rot13Response.error(405, "method not allowed");

	return await rot13Controller.postAsync(request);
};
