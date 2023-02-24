// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import { HttpServerResponse } from "http/http_server_response.js";

/**
 * Create success response for the ROT-13 server.
 * @param transformed the ROT-13 encoded text
 * @returns {HttpServerResponse} response for the server to return
 */
export function ok(transformed) {
	ensure.signature(arguments, [ String ]);

	return HttpServerResponse.createJsonResponse({
		status: 200,
		body: { transformed },
	});
}

/**
 * Create error response for the ROT-13 server.
 * @param status status code
 * @param error error description
 * @returns {HttpServerResponse} response for the server to return
 */
export function error(status, error) {
	ensure.signature(arguments, [ Number, String ]);

	return HttpServerResponse.createJsonResponse({
		status,
		body: { error },
	});
}