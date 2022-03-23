// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const Log = require("infrastructure/log");
const HttpRequest = require("http/http_request");

/**
 * Base class for all servers... not really necessary, given that the heavy lifting is performed by
 * HttpServer, but it reduces some duplication between WwwServer and Rot13Server. */
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

	async simulateRequestAsync(request) {
		ensure.signature(arguments, [ HttpRequest ]);

		return await this._httpServer.simulateRequestAsync(request);
	}

};