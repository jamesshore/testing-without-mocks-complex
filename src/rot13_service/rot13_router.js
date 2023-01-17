// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");
const GenericRouter = require("http/generic_router");
const Rot13Controller = require("./rot13_controller");
const Log = require("infrastructure/log");

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

		if (request.headers["x-request-id"] === undefined) {
			return errorHandler(400, "missing x-request-id header", request);
		}

		return await this._router.routeAsync(request, this._log);
	}

};

function errorHandler(status, error, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);

	return HttpResponse.createJsonResponse({
		status,
		body: { error }
	});
}