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
	return response(status, { error });
};

exports.badRequest = function(errorMessage) {
	ensure.signature(arguments, [ String ]);
	return exports.error(400, errorMessage);
};

function response(status, body) {
	return HttpResponse.createJsonResponse({ status, body });
}
