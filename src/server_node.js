// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const Log = require("infrastructure/log");
const HttpRequest = require("http/http_request");

/**
 * Base class for all servers. Not really necessary, given that the heavy lifting is performed by
 * HttpServer, but it reduces some duplication between WwwServer and Rot13Server, and also illustrates
 * how nullable wrappers work with inheritance. */
module.exports = class ServerNode {

	constructor(httpServer, router) {
		this._httpServer = httpServer;
		this._router = router;
		this._log = null;
	}

	get isStarted() {
		return this._httpServer.isStarted;
	}

	get port() {
		return this._httpServer.port;
	}

	get log() {
		return this._log;
	}

	get config() {
		return this._config;
	}

	async startAsync(port, log, config = {}) {
		ensure.signature(arguments, [ Number, Log, [ undefined, Object ]]);

		await this._httpServer.startAsync(port, log, config, request => this._router.routeAsync(request, config));
		this._log = log;
		this._config = config;
	}

	async simulateRequestAsync(request = HttpRequest.createNull()) {
		ensure.signature(arguments, [[ undefined, HttpRequest ]]);

		return await this._httpServer.simulateRequestAsync(request);
	}

};