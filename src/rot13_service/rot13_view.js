// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import { HttpServerResponse } from "http/http_server_response.js";

/** Success response for ROT-13 server */
export function ok(transformed) {
	ensure.signature(arguments, [ String ]);

	return HttpServerResponse.createJsonResponse({
		status: 200,
		body: { transformed },
	});
}

/** Error response for ROT-13 server */
export function error(status, error) {
	ensure.signature(arguments, [ Number, String ]);

	return HttpServerResponse.createJsonResponse({
		status,
		body: { error },
	});
}