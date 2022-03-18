// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");

/** error responses for user-facing www site */
exports.errorPage = function(status, message) {
	return HttpResponse.createPlainTextResponse({
		status: 501,
		body: `errorPage view not yet implemented (status: ${status})`,
	});
};
