// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");

/** Functions for generating ROT-13 service's responses */

exports.ok = function(output) {
	ensure.signature(arguments, [ String ]);
	return response(200, { transformed: output });
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
	return {
		status,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
}
