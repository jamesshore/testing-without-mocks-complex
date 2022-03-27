// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HomePageController = require("./home_page_controller");
const wwwView = require("./www_view");
const GenericRouter = require("http/generic_router");
const WwwConfig = require("./www_config");

/** Router for user-facing www site */
module.exports = class WwwRouter {

	static create() {
		return new WwwRouter(HomePageController.create());
	}

	static createNull() {
		return new WwwRouter(HomePageController.createNull());
	}

	constructor(homePageController) {
		this._router = GenericRouter.create(errorHandler, {
			"/": homePageController,
		});
	}

	async routeAsync(request, config) {
		ensure.signature(arguments, [ HttpRequest, WwwConfig ]);
		return await this._router.routeAsync(request, config);
	}

};

function errorHandler(status, errorMessage, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);
	return wwwView.errorPage(status, errorMessage);
}