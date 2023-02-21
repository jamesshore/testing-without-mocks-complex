// Copyright Titanium I.T. LLC.
import ensure from "util/ensure.cjs";
import CommandLine from "infrastructure/command_line.cjs";
import { HttpServer } from "http/http_server.mjs";
import Log from "infrastructure/log.cjs";
import { WwwRouter } from "./www/www_router.js";
import { Rot13Router } from "./rot13_service/rot13_router.js";

/** Application startup (parse command line and start servers) */
export class AllServers {

	static get USAGE() {
		return "Usage: run [www server port] [rot-13 server port]";
	}

	static create() {
		ensure.signature(arguments, []);

		return new AllServers(
			Log.create(),
			CommandLine.create(),
			HttpServer.create(),
			HttpServer.create(),
		);
	}

	constructor(log, commandLine, wwwServer, rot13Server) {
		ensure.signature(arguments, [ Log, CommandLine, HttpServer, HttpServer ]);

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
			await this.#startServersAsync(wwwPort, rot13Port);
		}
		catch (err) {
			logStartupError(this._log, args, err);
		}
	}

	async #startServersAsync(wwwPort, rot13Port) {
		const wwwLog = this._log.bind({ node: "www" });
		const rot13Log = this._log.bind({ node: "rot13" });

		this._wwwRouter = WwwRouter.create(wwwLog, rot13Port);
		this._rot13Router = Rot13Router.create(rot13Log);

		await Promise.all([
			this._wwwServer.startAsync(wwwPort, wwwLog, this._wwwRouter),
			this._rot13Server.startAsync(rot13Port, rot13Log, this._rot13Router),
		]);
	}

}

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