// Copyright Titanium I.T. LLC.
import ensure from "util/ensure.cjs";
import { HttpResponse } from "http/http_response.mjs";

/** Success response for ROT-13 server */
export function ok(transformed) {
	ensure.signature(arguments, [ String ]);

	return HttpResponse.createJsonResponse({
		status: 200,
		body: { transformed },
	});
}

/** Error response for ROT-13 server */
export function error(status, error) {
	ensure.signature(arguments, [ Number, String ]);

	return HttpResponse.createJsonResponse({
		status,
		body: { error },
	});
}