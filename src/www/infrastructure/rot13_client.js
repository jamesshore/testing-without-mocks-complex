// Copyright Titanium I.T. LLC.
import ensure from "util/ensure.cjs";
import type from "util/type.cjs";
import HttpClient from "http/http_client.cjs";
import OutputTracker from "util/output_tracker.cjs";
import EventEmitter from "events";

const HOST = "localhost";
const TRANSFORM_ENDPOINT = "/rot13/transform";
const RESPONSE_TYPE = { transformed: String };
const REQUEST_EVENT = "request";

/** Client for ROT-13 service */
export class Rot13Client {

	static create() {
		ensure.signature(arguments, []);
		
		return new Rot13Client(HttpClient.create());
	}

	static createNull(options) {
		ensure.signature(arguments, [ [ undefined, Array ] ]);

		const httpClient = HttpClient.createNull({
			[TRANSFORM_ENDPOINT]: nulledHttpResponses(options),
		});
		return new Rot13Client(httpClient);
	}

	constructor(httpClient) {
		ensure.signature(arguments, [ HttpClient ]);

		this._httpClient = httpClient;
		this._emitter = new EventEmitter();
	}

	transform(port, text, correlationId) {
		ensure.signature(arguments, [ Number, String, String ]);

		const { responsePromise, cancelFn } = this.#performRequest(port, text, correlationId);
		const transformPromise = this.#parseResponseAsync(responsePromise, port);
		return { transformPromise, cancelFn };
	}

	trackRequests() {
		ensure.signature(arguments, []);

		return new OutputTracker(this._emitter, REQUEST_EVENT);
	}

	#performRequest(port, text, correlationId) {
		const requestData = { port, text, correlationId };
		this._emitter.emit(REQUEST_EVENT, requestData);

		const { responsePromise, cancelFn: httpCancelFn } = this._httpClient.request({
			host: HOST,
			port,
			method: "POST",
			path: TRANSFORM_ENDPOINT,
			headers: {
				"content-type": "application/json",
				"x-correlation-id": correlationId,
			},
			body: JSON.stringify({ text }),
		});

		const cancelFn = () => {
			const cancelled = httpCancelFn(
				"ROT-13 service request cancelled\n" +
				`Host: ${HOST}:${port}\n` +
				`Endpoint: ${TRANSFORM_ENDPOINT}`,
			);
			if (cancelled) this._emitter.emit(REQUEST_EVENT, { ...requestData, cancelled: true });
		};

		return { responsePromise, cancelFn };
	}

	async #parseResponseAsync(responsePromise, port) {
		const response = await responsePromise;
		if (response.status !== 200) {
			throwError("Unexpected status from ROT-13 service", port, response);
		}
		if (response.body === "") {
			throwError("Body missing from ROT-13 service", port, response);
		}

		let parsedBody;
		try {
			parsedBody = JSON.parse(response.body);
		}
		catch(err) {
			throwError(`Unparseable body from ROT-13 service: ${err.message}`, port, response);
		}

		const typeError = type.check(parsedBody, RESPONSE_TYPE, { name: "body", allowExtraKeys: true });
		if (typeError !== null) {
			throwError(`Unexpected body from ROT-13 service: ${typeError}`, port, response);
		}
		return parsedBody.transformed;
	}

}


function throwError(message, port, response) {
	throw new Error(
`${message}
Host: ${HOST}:${port}
Endpoint: ${TRANSFORM_ENDPOINT}
Status: ${response.status}
Headers: ${JSON.stringify(response.headers)}
Body: ${response.body}`
	);
}

function nulledHttpResponses(responses = [ {} ]) {
	return responses.map((response) => nulledHttpResponse(response));
}

function nulledHttpResponse({
	response = "Null Rot13Client response",
	error,
	hang = false,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		response: [ undefined, String ],
		error: [ undefined, String ],
		hang: [ undefined, Boolean ],
	}]]);

	if (error !== undefined) {
		return {
			status: 500,
			headers: {},
			body: error,
			hang,
		};
	}
	else {
		return {
			status: 200,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ transformed: response }),
			hang,
		};
	}
}
