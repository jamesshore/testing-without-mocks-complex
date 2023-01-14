// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HomePageController = require("./home_page/home_page_controller");
const wwwView = require("./www_view");
const GenericRouter = require("http/generic_router");
const WwwConfig = require("./www_config");

/** Router for user-facing website */
module.exports = class WwwRouter {

	static create(config) {
		ensure.signature(arguments, [ WwwConfig ]);

		return new WwwRouter(config);
	}

	constructor(config) {
		this._config = config;

		this._router = GenericRouter.create(errorHandler, {
			"/": HomePageController.create(),
		});
	}

	async routeAsync(request) {
		ensure.signature(arguments, [ HttpRequest ]);

		return await this._router.routeAsync(request, this._config);
	}

};

function errorHandler(status, errorMessage, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);

	return wwwView.errorPage(status, errorMessage);
}