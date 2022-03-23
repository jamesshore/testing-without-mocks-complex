// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const ServerNode = require("../server_node");
const HttpServer = require("http/http_server");
const WwwRouter = require("./www_router");

/** Server for user-facing www site */
module.exports = class WwwServer extends ServerNode {

	static create() {
		ensure.signature(arguments, []);
		return new this(HttpServer.create());
	}

	static createNull() {
		ensure.signature(arguments, []);
		return new this(HttpServer.createNull());
	}

	constructor(httpServer) {
		super(httpServer, WwwRouter.create());
	}

};