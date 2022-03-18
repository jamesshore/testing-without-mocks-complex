// Copyright Titanium I.T. LLC.
"use strict";

const CommandLine = require("infrastructure/command_line");
const ensure = require("util/ensure");
const Rot13Client = require("./infrastructure/rot13_client");
const Clock = require("infrastructure/clock");
const HttpServer = require("http/http_server");
const HttpResponse = require("http/http_response");
const Log = require("infrastructure/log");
const WwwRouter = require("./www_router");

const TIMEOUT_IN_MS = 5000;

/** Web server for user-facing www site */
module.exports = class WwwServer {

	static create({
		httpServer,
	} = {}) {
		ensure.signature(arguments, [{
			httpServer: HttpServer,
		}]);
		return new WwwServer(httpServer);
	}

	constructor(httpServer) {
		this._httpServer = httpServer;
		this._router = WwwRouter.create();
	}

	async serveAsync(port) {
		ensure.signature(arguments, [Number]);

		const onRequestAsync = async (request) => {
			return await this._router.routeAsync(request);
		};

		await this._httpServer.startAsync({ port, onRequestAsync });
	}

};


// exports.runAsync = async function({
// 	commandLine = CommandLine.create(),
// 	rot13Client = Rot13Client.create(),
// 	clock = Clock.create(),
// } = {}) {
// 	ensure.signature(arguments, [[ undefined, {
// 		commandLine: [ undefined, CommandLine ],
// 		rot13Client: [ undefined, Rot13Client ],
// 		clock: [ undefined, Clock ],
// 	}]]);
//
// 	const args = commandLine.args();
// 	if (args.length !== 2) {
// 		commandLine.writeStderr("Usage: run PORT TEXT\n");
// 		return;
// 	}
//
// 	const port = parseInt(args[0], 10);
// 	const text = args[1];
//
// 	try {
// 		const { transformPromise, cancelFn } = rot13Client.transform(port, text);
// 		const response = await clock.timeoutAsync(TIMEOUT_IN_MS, transformPromise, () => timeout(cancelFn));
// 		commandLine.writeStdout(response + "\n");
// 	}
// 	catch (err) {
// 		commandLine.writeStderr("ROT-13 service failed:\n");
// 		commandLine.writeStderr(err.message + "\n");
// 	}
// };
//
// function timeout(cancelFn) {
// 	cancelFn();
// 	throw new Error("Service timed out.");
// }{}