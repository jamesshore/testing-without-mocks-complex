// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");
const wwwView = require("./www_view");

/** Endpoints for / (home page) */
module.exports = class HomePageController {

	static create() {
		return new HomePageController();
	}

	static createNull() {
		return new HomePageController();
	}

	getAsync(request) {
		return wwwView.homePage();
	}

	async postAsync(request) {
		const text = parseBody(await request.readBodyAsync());
		return wwwView.homePage(text);
	}

};

function parseBody(body) {
	const [ name, value ] = body.split("=");
	return value;
}