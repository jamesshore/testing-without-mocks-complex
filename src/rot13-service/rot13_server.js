// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const CommandLine = require("infrastructure/command_line");
const HttpServer = require("http/http_server");
const Log = require("infrastructure/log");
const Rot13Router = require("./rot13_router");

/** Top-level 'traffic cop' for ROT-13 service */
module.exports = class Rot13Server {

	static create() {
		ensure.signature(arguments, []);

		return new Rot13Server(
			CommandLine.create(),
			HttpServer.create(Log.create()),
		);
	}

	constructor(commandLine, httpServer) {
		ensure.signature(arguments, [ CommandLine, HttpServer ]);

		this._commandLine = commandLine;
		this._httpServer = httpServer;
		this._router = Rot13Router.create();
	}

	async startAsync() {
		ensure.signature(arguments, []);

		const args = this._commandLine.args();
		if (args.length !== 1) {
			this._commandLine.writeStderr(`Usage: serve PORT\n`);
			return;
		}

		const port = parseInt(args[0], 10);
		await this._httpServer.startAsync({ port, onRequestAsync: onRequestAsync.bind(null, this) });
		await this._commandLine.writeStdout(`Server started on port ${port}\n`);
	}

};

async function onRequestAsync(self, request) {
	self._commandLine.writeStdout("Received request\n");
	return await self._router.routeAsync(request);
}
