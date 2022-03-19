// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const CommandLine = require("infrastructure/command_line");
const WwwServer = require("./www/www_server");
const Rot13Server = require("./rot13_service/rot13_server");

/** Wrapper for starting all the servers needed for the site to work */
module.exports = class AllServers {

	static create() {
		ensure.signature(arguments, []);
		return new WwwServer(CommandLine.create(), WwwServer.create(), Rot13Server.create());
	}

	constructor(commandLine, wwwServer, rot13Server) {
		this._commandLine = commandLine;
		this._wwwServer = wwwServer;
		this._rot13Server = rot13Server;
	}

	async startAsync() {
		const args = this._commandLine.args();

		const wwwPort = parseInt(args[0], 10);
		const rot13Port = parseInt(args[1], 10);

		await Promise.all([
			this._wwwServer.startAsync(wwwPort),
			this._rot13Server.startAsync(rot13Port),
		]);
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