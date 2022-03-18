// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpServer = require("http/http_server");
const Log = require("infrastructure/log");
const WwwRouter = require("./www_router");

/** Server for user-facing www site */
module.exports = class WwwServer {

	static create() {
		ensure.signature(arguments, []);

		return new WwwServer(HttpServer.create(Log.create()));
	}

	constructor(httpServer) {
		this._httpServer = httpServer;
		this._router = WwwRouter.create();
	}

	get isStarted() {
		return this._httpServer.isStarted;
	}

	get port() {
		return this._httpServer.port;
	}

	async serveAsync(port) {
		ensure.signature(arguments, [ Number ]);

		await this._httpServer.startAsync(port, request => this._router.routeAsync(request));
	}

};