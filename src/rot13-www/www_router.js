// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const wwwController = require("./www_controller");
const wwwView = require("./www_view");
const GenericRouter = require("http/generic_router");

/** Router for user-facing www site */
module.exports = class WwwRouter {

	static create() {
		return new WwwRouter();
	}

	constructor() {
		this._router = GenericRouter.create(errorHandler, {
			"/": wwwController,
		});
	}

	async routeAsync(request) {
		return await this._router.routeAsync(request);
	}

};

function errorHandler(status, errorMessage, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);
	return wwwView.errorPage(status, errorMessage);
}