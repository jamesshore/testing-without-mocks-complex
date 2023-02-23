// Copyright Titanium I.T. LLC.
import * as type from "util/type.js";
import { HttpClient, HttpClientResponse, NulledHttpClientResponse } from "http/http_client.js";
import { OutputListener, OutputTracker } from "util/output_listener.js";

const HOST = "localhost";
const TRANSFORM_ENDPOINT = "/rot13/transform";
const RESPONSE_TYPE = { transformed: String };

export interface Rot13ClientOutput {
	port: number,
	text: string,
	correlationId: string,
	cancelled?: boolean,
}

export type NulledRot13ClientResponses = NulledRot13ClientResponse[];

export interface NulledRot13ClientResponse {
	response?: string,
	error?: string,
	hang?: boolean,
}

/** Client for ROT-13 service */
export class Rot13Client {

	private readonly _listener: OutputListener<Rot13ClientOutput>;

	/**
	 * Factory method. Creates the client.
	 * @returns {Rot13Client} the client
	 */
	static create(): Rot13Client {
		return new Rot13Client(HttpClient.create());
	}

	/**
	 * Factory method. Creates a 'nulled' client that makes requests to a simulated ROT-13 service rather
	 * than making real HTTP requests.
	 * @param [options] Array of simulated responses for nulled instance to return. Each request returns
	 * the next simulated response in the array.
	 * @param [options[].response] the transformed text returned by the simulated service
	 * @param [options[].error] if defined, causes the simulated service to return an error
	 * @param [options[].hang] if true, the simulated request never returns
	 * @returns {Rot13Client} the nulled client
	 */

	static createNull(options: NulledRot13ClientResponses = [ {} ]): Rot13Client {
		const httpResponses = options.map((response) => nulledHttpResponse(response));

		const httpClient = HttpClient.createNull({
			[TRANSFORM_ENDPOINT]: httpResponses,
		});
		return new Rot13Client(httpClient);
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(private readonly _httpClient: HttpClient) {
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
	transform(
		port: number,
		text: string,
		correlationId: string,
	): {
		transformPromise: Promise<string>,
		cancelFn: () => void
	} {
		const { responsePromise, cancelFn } = this.#performRequest(port, text, correlationId);
		const transformPromise = this.#parseResponseAsync(responsePromise, port);
		return { transformPromise, cancelFn };
	}

	/**
	 * Track requests made to the ROT-13 service.
	 * @returns {OutputTracker} the request tracker
	 */
	trackRequests(): OutputTracker<Rot13ClientOutput> {
		return this._listener.trackOutput();
	}

	#performRequest(
		port: number,
		text: string,
		correlationId: string,
	): {
		responsePromise: Promise<HttpClientResponse>,
		cancelFn: () => void,
	} {
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

	async #parseResponseAsync(responsePromise: Promise<HttpClientResponse>, port: number): Promise<string> {
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


function throwError(message: string, port: number, response: HttpClientResponse): never {
	throw new Error(
`${message}
Host: ${HOST}:${port}
Endpoint: ${TRANSFORM_ENDPOINT}
Status: ${response.status}
Headers: ${JSON.stringify(response.headers)}
Body: ${response.body}`
	);
}

function nulledHttpResponse({
	response = "Nulled Rot13Client response",
	error,
	hang = false,
}: NulledRot13ClientResponse = {}): NulledHttpClientResponse {
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
