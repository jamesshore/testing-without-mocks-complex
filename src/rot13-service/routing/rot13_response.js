// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpResponse = require("http/http_response");

/** Functions for generating ROT-13 service's responses */

exports.ok = function(output) {
	ensure.signature(arguments, [ String ]);
	return response(200, { transformed: output });
};

exports.error = function(status, error) {
	ensure.signature(arguments, [ Number, String ]);
	return errorResponse(status, error);
};

exports.notFound = function() {
	ensure.signature(arguments, []);
	return errorResponse(404, "not found");
};

exports.methodNotAllowed = function() {
	ensure.signature(arguments, []);
	return errorResponse(405, "method not allowed");
};

exports.badRequest = function(errorMessage) {
	ensure.signature(arguments, [ String ]);
	return errorResponse(400, errorMessage);
};

function errorResponse(status, error) {
	return response(status, { error });
}

function response(status, body) {
	return HttpResponse.createJsonResponse({ status, body });
}
