// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HomePageController = require("./home_page/home_page_controller");
const wwwView = require("./www_view");
const GenericRouter = require("http/generic_router");
const WwwConfig = require("./www_config");
const Log = require("infrastructure/log");
const UuidGenerator = require("./infrastructure/uuid_generator");

/** Router for user-facing website */
module.exports = class WwwRouter {

	static create(log, rot13ServicePort) {
		ensure.signature(arguments, [ Log, Number ]);

		return new WwwRouter(
			log,
			rot13ServicePort,
			UuidGenerator.create(),
			HomePageController.create(),
		);
	}

	static createNull({
		log = Log.createNull(),
		port = 42,
		uuids = UuidGenerator.createNull(),
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			port: [ undefined, Number ],
			uuids: [ undefined, UuidGenerator ],
		}]]);

		return new WwwRouter(
			log,
			port,
			uuids,
			HomePageController.createNull(),
		);
	}

	constructor(log, rot13ServicePort, uuids, homePageController) {
		ensure.signature(arguments, [ Log, Number, UuidGenerator, HomePageController ]);

		this._log = log;
		this._rot13ServicePort = rot13ServicePort;
		this._uuids = uuids;

		this._router = GenericRouter.create(errorHandler, {
			"/": homePageController,
		});
	}

	get log() {
		return this._log;
	}

	get rot13ServicePort() {
		return this._rot13ServicePort;
	}

	async routeAsync(request) {
		ensure.signature(arguments, [ HttpRequest ]);

		const correlationId = this._uuids.generate();
		const log = this._log.bind({ correlationId });
		const config = WwwConfig.create(log, this._rot13ServicePort, correlationId);

		return await this._router.routeAsync(request, log, config);
	}

};

function errorHandler(status, errorMessage, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);

	return wwwView.errorPage(status, errorMessage);
}