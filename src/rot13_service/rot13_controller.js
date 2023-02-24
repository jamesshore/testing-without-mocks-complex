// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as rot13Logic from "./rot13_logic.js";
import * as rot13View from "./rot13_view.js";
import { HttpServerRequest } from "http/http_server_request.js";

const REQUEST_TYPE = { text: String };

/** Endpoint for /rot13/transform */
export class Rot13Controller {

	static create() {
		ensure.signature(arguments, []);

		return new Rot13Controller();
	}

	async postAsync(request) {
		ensure.signatureMinimum(arguments, [ HttpServerRequest ]);

		const { input, err } = await this.#parseRequestAsync(request);
		if (err !== undefined) return rot13View.error(400, err);

		const output = rot13Logic.transform(input);
		return rot13View.ok(output);
	}

	async #parseRequestAsync(request) {
		ensure.signatureMinimum(arguments, [ HttpServerRequest ]);

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