// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const CommandLine = require("infrastructure/command_line");
const WwwServer = require("./www/www_server");
const Rot13Server = require("./rot13_service/rot13_server");
const Log = require("infrastructure/log");

/** Application startup (parse command line and start servers) */
const AllServers = module.exports = class AllServers {

	static get USAGE() {
		return "Usage: run [www server port] [rot-13 server port]";
	}

	static create() {
		ensure.signature(arguments, []);

		return new AllServers(Log.create(), CommandLine.create(), WwwServer.create(), Rot13Server.create());
	}

	constructor(log, commandLine, wwwServer, rot13Server) {
		this._log = log;
		this._commandLine = commandLine;
		this._wwwServer = wwwServer;
		this._rot13Server = rot13Server;
	}

	async startAsync() {
		ensure.signature(arguments, []);

		const args = this._commandLine.args();
		try {
			const { wwwPort, rot13Port } = parseArgs(args);
			await this.#startServers(wwwPort, rot13Port);
		}
		catch (err) {
			logStartupError(this._log, args, err);
		}
	}

	async #startServers(wwwPort, rot13Port) {
		const wwwLog = this._log.bind({ node: "www" });
		const rot13Log = this._log.bind({ node: "rot13" });

		await Promise.all([
			this._wwwServer.startAsync(wwwPort, wwwLog, rot13Port),
			this._rot13Server.startAsync(rot13Port, rot13Log),
		]);
	}

};

function parseArgs(args) {
	if (args.length !== 2) throw new Error(`invalid command-line arguments (${AllServers.USAGE})`);

	return {
		wwwPort: parse(args[0], "www server"),
		rot13Port: parse(args[1], "ROT-13 server"),
	};

	function parse(arg, name) {
		const result = parseInt(arg, 10);
		if (Number.isNaN(result)) throw new Error(`${name} port is not a number`);
		return result;
	}
}

function logStartupError(log, args, err) {
	log.emergency({
		message: "startup error",
		commandLineArguments: args,
		error: err,
	});
}