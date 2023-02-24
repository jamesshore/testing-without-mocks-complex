// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as type from "util/type.js";
import { HttpClient } from "http/http_client.js";
import { OutputListener } from "util/output_listener.js";

const HOST = "localhost";
const TRANSFORM_ENDPOINT = "/rot13/transform";
const RESPONSE_TYPE = { transformed: String };

/** Client for ROT-13 service */
export class Rot13Client {

	/**
	 * Factory method.
	 * @returns {Rot13Client} the instance
	 */
	static create() {
		ensure.signature(arguments, []);
		
		return new Rot13Client(HttpClient.create());
	}

	/**
	 * Nulled factory method.
	 * @param [options] array of responses for nulled instance to return
	 * @param [options[].response] transformed text
	 * @param [options[].error] if defined, causes an error to be thrown
	 * @param [options[].hang] if true, the request never returns
	 * @returns {Rot13Client} the nulled instance
	 */
	static createNull(options) {
		ensure.signature(arguments, [ [ undefined, Array ] ]);

		const httpClient = HttpClient.createNull({
			[TRANSFORM_ENDPOINT]: nulledHttpResponses(options),
		});
		return new Rot13Client(httpClient);
	}

	/** @deprecated Use a factory method instead. */
	constructor(httpClient) {
		ensure.signature(arguments, [ HttpClient ]);

		this._httpClient = httpClient;
		this._listener = new OutputListener();
	}

	/**
	 * Call the ROT-13 service. Returns a promise for the server response and a function for cancelling the request.
	 * @param port the port of the ROT-13 service (the host is assumed to be 'localhost')
	 * @param text the text to transform
	 * @param correlationId a unique ID for this user's request
	 * @returns {{transformPromise: Promise<string>, cancelFn: () => void}} the response promise and
	 * cancellation function
	 */
	transform(port, text, correlationId) {
		ensure.signature(arguments, [ Number, String, String ]);

		const { responsePromise, cancelFn } = this.#performRequest(port, text, correlationId);
		const transformPromise = this.#parseResponseAsync(responsePromise, port);
		return { transformPromise, cancelFn };
	}

	/**
	 * Track requests made to the ROT-13 service.
	 * @returns {OutputTracker} the request tracker
	 */
	trackRequests() {
		ensure.signature(arguments, []);

		return this._listener.trackOutput();
	}

	#performRequest(port, text, correlationId) {
		const requestData = { port, text, correlationId };
		this._listener.emit(requestData);

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
			if (cancelled) this._listener.emit({ ...requestData, cancelled: true });
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
