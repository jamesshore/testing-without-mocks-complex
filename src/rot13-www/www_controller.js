// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");

/** GET endpoint for / */
exports.getAsync = function(request) {
	return HttpResponse.createPlainTextResponse({
		status: 501,
		body: "controller not yet implemented",
	});
};