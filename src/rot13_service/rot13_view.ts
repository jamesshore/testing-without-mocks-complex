// Copyright Titanium I.T. LLC.
import { HttpServerResponse } from "http/http_server_response.js";

/**
 * Create success response for the ROT-13 server.
 * @param transformed the ROT-13 encoded text
 * @returns {HttpServerResponse} response for the server to return
 */
export function ok(transformed: string): HttpServerResponse {
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
export function error(status: number, error: string): HttpServerResponse {
	return HttpServerResponse.createJsonResponse({
		status,
		body: { error },
	});
}