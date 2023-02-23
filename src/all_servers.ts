// Copyright Titanium I.T. LLC.
import { CommandLine } from "infrastructure/command_line.js";
import { HttpServer } from "http/http_server.js";
import { Log } from "infrastructure/log.js";
import { WwwRouter } from "./www/www_router.js";
import { Rot13Router } from "./rot13_service/rot13_router.js";

/** Application startup (parse command line and start servers). */
export class AllServers {

	_wwwRouter?: WwwRouter;
	_rot13Router?: Rot13Router;

	/** Only for use by tests. The command-line interface's "usage" string. */
	static get USAGE(): string {
		return "Usage: run [www server port] [rot-13 server port]";
	}

	/**
	 * Factory method. Creates the servers, but doesn't start them.
	 * @returns {AllServers} the servers
	 */
	static create(): AllServers {
		return new AllServers(
			Log.create(),
			CommandLine.create(),
			HttpServer.create(),
			HttpServer.create(),
		);
	}

	/** Only for use by tests. (Use the factory method instead.) */
	constructor(
		private readonly _log: Log,
		private readonly _commandLine: CommandLine,
		private readonly _wwwServer: HttpServer,
		private readonly _rot13Server: HttpServer,
	) {
	}

	/**
	 * Parse the command line and start the servers.
	 */
	async startAsync(): Promise<void> {
		const args = this._commandLine.args();
		try {
			const { wwwPort, rot13Port } = parseArgs(args);
			await this.#startServersAsync(wwwPort, rot13Port);
		}
		catch (err) {
			logStartupError(this._log, args, err);
		}
	}

	async #startServersAsync(wwwPort: number, rot13Port: number): Promise<void> {
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

function parseArgs(args: string[]): { wwwPort: number, rot13Port: number } {
	if (args.length !== 2) throw new Error(`invalid command-line arguments (${AllServers.USAGE})`);

	return {
		wwwPort: parse(args[0]!, "www server"),
		rot13Port: parse(args[1]!, "ROT-13 server"),
	};

	function parse(arg: string, name: string): number {
		const result = parseInt(arg, 10);
		if (Number.isNaN(result)) throw new Error(`${name} port is not a number`);
		return result;
	}
}

function logStartupError(log: Log, args: string[], err: any): void {
	log.emergency({
		message: "startup error",
		commandLineArguments: args,
		error: err,
	});
}