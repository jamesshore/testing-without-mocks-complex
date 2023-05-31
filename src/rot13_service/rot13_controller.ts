// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as rot13Logic from "./rot13_logic.js";
import * as rot13View from "./rot13_view.js";
import { HttpServerRequest } from "http/http_server_request.js";
import { HttpServerResponse } from "http/http_server_response.js";

const REQUEST_TYPE = { text: String };

/** Endpoint for /rot13/transform */
export class Rot13Controller {

	/**
	 * Factory method. Creates the controller.
	 * @returns {Rot13Controller} the controller
	 */
	static create(): Rot13Controller {
		return new Rot13Controller();
	}

	/**
	 * Handle post request
	 * @param request HTTP request
	 * @returns {Promise<HttpServerResponse>} HTTP response
	 */
	async postAsync(request: HttpServerRequest): Promise<HttpServerResponse> {
		const { input, err } = await this.#parseRequestAsync(request);
		if (err !== undefined) return rot13View.error(400, err);

		const output = rot13Logic.transform(input!);
		return rot13View.ok(output);
	}

	async #parseRequestAsync(request: HttpServerRequest): Promise<{ input?: string, err?: string }> {
		try {
			if (!request.hasContentType("application/json")) throw new Error("invalid content-type header");

			const json = JSON.parse(await request.readBodyAsync());
			ensure.typeMinimum(json, REQUEST_TYPE, "request");

			return { input: json.text };
		}
		catch (error) {
			return { err: error.message };
		}
	}

}