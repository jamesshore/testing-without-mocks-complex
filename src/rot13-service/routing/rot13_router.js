// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const rot13Controller = require("./rot13_controller");
const HttpResponse = require("http/http_response");

/** Top-level router for ROT-13 service */
exports.routeAsync = async function(request) {
	ensure.signature(arguments, [ HttpRequest ]);

	if (request.urlPathname !== "/rot13/transform") return errorResponse(404, "not found");
	if (request.method !== "POST") return errorResponse(405, "method not allowed");

	return await rot13Controller.postAsync(request);
};

function errorResponse(status, error) {
	return HttpResponse.createJsonResponse({
		status,
		body: { error }
	});
}
