// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const wwwView = require("./www_view");
const Rot13Client = require("./infrastructure/rot13_client");
const HttpRequest = require("http/http_request");
const WwwConfig = require("./www_config");

const INPUT_FIELD_NAME = "text";

/** Endpoints for / (home page) */
module.exports = class HomePageController {

	static create() {
		ensure.signature(arguments, []);
		return new HomePageController(Rot13Client.create());
	}

	static createNull({
		rot13Client = Rot13Client.createNull(),
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			rot13Client: [ undefined, Rot13Client ],
		}]]);
		return new HomePageController(rot13Client);
	}

	constructor(rot13Client) {
		this._rot13Client = rot13Client;
	}

	getAsync(request) {
		ensure.signature(arguments, [ HttpRequest, WwwConfig ]);

		return wwwView.homePage();
	}

	async postAsync(request, config) {
		ensure.signature(arguments, [ HttpRequest, WwwConfig ]);

		const { input, err } = parseBody(await request.readBodyAsync(), config.log);
		if (err !== undefined) return wwwView.homePage();

		const { transformPromise } = this._rot13Client.transform(config.rot13ServicePort, input);
		return wwwView.homePage(await transformPromise);
	}

};

function parseBody(body, log) {
	try {
		const params = new URLSearchParams(body);
		const textFields = params.getAll(INPUT_FIELD_NAME);

		if (textFields.length === 0) throw new Error(`'${INPUT_FIELD_NAME}' form field not found`);
		if (textFields.length > 1) throw new Error(`multiple '${INPUT_FIELD_NAME}' form fields found`);

		return { input: textFields[0] };
	}
	catch (err) {
		log.monitor({
			message: "form parse error in POST /",
			details: err.message,
			body,
		});
		return { err };
	}
}