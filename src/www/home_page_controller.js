// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const wwwView = require("./www_view");
const Rot13Client = require("./infrastructure/rot13_client");
const HttpRequest = require("http/http_request");
const WwwConfig = require("./www_config");

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

		const text = parseBody(await request.readBodyAsync());
		const { transformPromise } = this._rot13Client.transform(config.rot13ServicePort, text);
		return wwwView.homePage(await transformPromise);
	}

};

function parseBody(body) {
	const [ name, value ] = body.split("=");
	return value;
}