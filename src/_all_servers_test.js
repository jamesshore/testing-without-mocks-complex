// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const AllServers = require("./all_servers");
const CommandLine = require("infrastructure/command_line");
const WwwServer = require("./www/www_server");
const Rot13Server = require("./rot13_service/rot13_server");
const Log = require("infrastructure/log");

const VALID_ARGS = [ "1000", "2000" ];

describe("All servers", () => {

	describe("happy path", () => {

		it("starts servers", async () => {
			const { wwwServer, rot13Server } = await startAsync();

			assert.equal(wwwServer.isStarted, true, "www server should be started");
			assert.equal(rot13Server.isStarted, true, "Rot-13 service should be started");
		});

		it("uses ports provided on command line", async () => {
			const { wwwServer, rot13Server } = await startAsync({ args: [ "5001", "5002" ] });

			assert.equal(wwwServer.port, 5001, "www port");
			assert.equal(rot13Server.port, 5002, "ROT-13 port");
		});

		it("binds node name to server logs", async () => {
			const { wwwServer, rot13Server } = await startAsync();

			assert.deepEqual(wwwServer.log.defaults, { node: "www" });
			assert.deepEqual(rot13Server.log.defaults, { node: "rot13" });
		});

	});


	describe("error handling", () => {

		it("logs error if wrong number of arguments provided", async () => {
			const { logOutput } = await startAsync({ args: [ "one", "two", "three" ] });
			assert.deepEqual(logOutput.data, [
				{
					alert: "emergency",
					message: "startup error",
					error: `Error: invalid command-line arguments (${AllServers.USAGE})`,
					commandLineArguments: [ "one", "two", "three" ],
				},
			]);
		});

		it("logs error if ports aren't numbers", async () => {
			const { logOutput: wwwLog } = await startAsync({ args: [ "xxx", "1000" ] });
			const { logOutput: rot13Log } = await startAsync({ args: [ "1000", "xxx" ] });

			assertLogError(wwwLog, "www", [ "xxx", "1000" ]);
			assertLogError(rot13Log, "ROT-13", [ "1000", "xxx" ]);

			function assertLogError(logOutput, serverName, args) {
				assert.deepEqual(logOutput.data, [
					{
						alert: "emergency",
						message: "startup error",
						commandLineArguments: args,
						error: `Error: ${serverName} server port is not a number`,
					},
				]);
			}
		});

	});

});

async function startAsync({
	args = VALID_ARGS,
} = {}) {
	ensure.signature(arguments, [
		[
			undefined, {
			args: [ undefined, Array ],
		},
		],
	]);

	const log = Log.createNull();
	const logOutput = log.trackOutput();

	const commandLine = CommandLine.createNull({ args });

	const wwwServer = WwwServer.createNull();
	const rot13Server = Rot13Server.createNull();

	const servers = new AllServers(log, commandLine, wwwServer, rot13Server);
	await servers.startAsync();

	return {
		wwwServer,
		rot13Server,
		logOutput,
	};
}
