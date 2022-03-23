// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const ServerNode = require("../server_node");
const HttpServer = require("http/http_server");
const Rot13Router = require("./rot13_router");

/** Server for ROT-13 service */
module.exports = class Rot13Server extends ServerNode {

	static create() {
		ensure.signature(arguments, []);
		return new this(HttpServer.create());
	}

	static createNull() {
		ensure.signature(arguments, []);
		return new this(HttpServer.createNull());
	}

	constructor(httpServer) {
		super(httpServer, Rot13Router.create());
	}

};
