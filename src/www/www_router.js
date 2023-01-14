// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HomePageController = require("./home_page/home_page_controller");
const wwwView = require("./www_view");
const GenericRouter = require("http/generic_router");
const WwwConfig = require("./www_config");
const Log = require("infrastructure/log");

/** Router for user-facing website */
module.exports = class WwwRouter {

	static create(log, rot13ServicePort) {
		ensure.signature(arguments, [ Log, Number ]);

		return new WwwRouter(log, rot13ServicePort);
	}

	static createNull({
		log = Log.createNull(),
		port = 42,
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			port: [ undefined, Number ],
		}]]);

		return new WwwRouter(log, port);
	}

	constructor(log, rot13ServicePort) {
		this._config = WwwConfig.create(log, rot13ServicePort);

		this._router = GenericRouter.create(errorHandler, {
			"/": HomePageController.create(),
		});
	}

	get log() {
		return this._config.log;
	}

	get rot13ServicePort() {
		return this._config.rot13ServicePort;
	}

	async routeAsync(request) {
		ensure.signature(arguments, [ HttpRequest ]);

		return await this._router.routeAsync(request, Log.createNull(), this._config);
	}

};

function errorHandler(status, errorMessage, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);

	return wwwView.errorPage(status, errorMessage);
}