// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpServer = require("http/http_server");
const Log = require("infrastructure/log");
const WwwRouter = require("./www/www_router");

/** Server for user-facing www site */
module.exports = class ServerNode {

	constructor(httpServer, router) {
		this._httpServer = httpServer;
		this._router = router;
	}

	get isStarted() {
		return this._httpServer.isStarted;
	}

	get port() {
		return this._httpServer.port;
	}

	async startAsync(port, log) {
		ensure.signature(arguments, [ Number, Log ]);

		await this._httpServer.startAsync(port, log, request => this._router.routeAsync(request));
	}

};