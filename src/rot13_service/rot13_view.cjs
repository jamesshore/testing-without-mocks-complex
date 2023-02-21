// Copyright Titanium I.T. LLC.
const ensure = require("util/ensure");
const HttpResponse = require("http/http_response");

/** Success response for ROT-13 server */
exports.ok = function(transformed) {
	ensure.signature(arguments, [ String ]);

	return HttpResponse.createJsonResponse({
		status: 200,
		body: { transformed },
	});
};

/** Error response for ROT-13 server */
exports.error = function (status, error) {
	ensure.signature(arguments, [ Number, String ]);

	return HttpResponse.createJsonResponse({
		status,
		body: { error },
	});
};