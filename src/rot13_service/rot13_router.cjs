// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");
const GenericRouter = require("http/generic_router");
const Rot13Controller = require("./rot13_controller.cjs");
const Log = require("infrastructure/log");
const rot13View = require("./rot13_view.cjs");

/** Router for ROT-13 service */
module.exports = class Rot13Router {

	static create(log) {
		ensure.signature(arguments, [ Log ]);

		return new Rot13Router(log);
	}

	static createNull({
		log = Log.createNull(),
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
		}]]);

		return new Rot13Router(log);
	}

	constructor(log) {
		ensure.signature(arguments, [ Log ]);

		this._log = log;
		this._router = GenericRouter.create(errorHandler, {
			"/rot13/transform": Rot13Controller.create(),
		});
	}

	get log() {
		return this._log;
	}

	async routeAsync(request) {
		ensure.signature(arguments, [ HttpRequest ]);

		const correlationId = request.headers["x-correlation-id"];
		if (correlationId === undefined) {
			return rot13View.error(400, "missing x-correlation-id header");
		}

		const log = this._log.bind({ correlationId });
		return await this._router.routeAsync(request, log);
	}

};

function errorHandler(status, error, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);

	return rot13View.error(status, error);
}