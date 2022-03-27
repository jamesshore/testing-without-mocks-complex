// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const wwwView = require("./www_view");
const Rot13Client = require("./infrastructure/rot13_client");

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
		return wwwView.homePage();
	}

	async postAsync(request) {
		const text = parseBody(await request.readBodyAsync());
		const { transformPromise } = this._rot13Client.transform(1234, text);
		return wwwView.homePage(await transformPromise);
	}

};

function parseBody(body) {
	const [ name, value ] = body.split("=");
	return value;
}