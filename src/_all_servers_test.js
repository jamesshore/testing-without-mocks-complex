// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const AllServers = require("./all_servers");
const CommandLine = require("infrastructure/command_line");
const HttpServer = require("http/http_server");
const HttpRequest = require("http/http_request");
const Log = require("infrastructure/log");
const WwwRouter = require("./www/www_router");
const Rot13Router = require("./rot13_service/rot13_router");
const WwwConfig = require("./www/www_config");

const VALID_ARGS = [ "1000", "2000" ];

describe("All servers", () => {

	describe("happy path", () => {

		it("starts servers", async () => {
			const { wwwServer, rot13Server } = await startAsync();

			assert.equal(wwwServer.isStarted, true, "WWW server should be started");
			assert.equal(rot13Server.isStarted, true, "ROT-13 service should be started");
		});

		it("uses ports provided on command line", async () => {
			const { wwwServer, rot13Server } = await startAsync({ args: [ "5001", "5002" ] });

			assert.equal(wwwServer.port, 5001, "www port");
			assert.equal(rot13Server.port, 5002, "ROT-13 port");
		});

		it("provides WWW router with ROT-13 service port", async () => {
			const { wwwRouter } = await startAsync({ args: [ "5001", "5002" ]});

			assert.equal(wwwRouter.rot13ServicePort, 5002, "port");
		});

		it("binds node name to router logs", async () => {
			const { wwwRouter, rot13Router } = await startAsync();

			assert.deepEqual(wwwRouter.log.defaults, { node: "www" });
			assert.deepEqual(rot13Router.log.defaults, { node: "rot13" });
		});

		it("routes WWW requests", async () => {
			const { wwwServer } = await startAsync();

			const request = HttpRequest.createNull({ url: "/", method: "GET" });

			const expectedResponse = await WwwRouter.createNull().routeAsync(request);
			const actualResponse = await wwwServer.simulateRequestAsync(request);

			assert.deepEqual(actualResponse, expectedResponse);
		});

		it("routes ROT-13 service requests", async () => {
			const { rot13Server } = await startAsync();

			const request = HttpRequest.createNull({ url: "/rot13/transform", method: "POST" });

			const expectedResponse = await Rot13Router.createNull().routeAsync(request);
			const actualResponse = await rot13Server.simulateRequestAsync(request);

			assert.deepEqual(actualResponse, expectedResponse);
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
	ensure.signature(arguments, [[ undefined, {
		args: [ undefined, Array ],
	}]]);

	const log = Log.createNull();
	const logOutput = log.trackOutput();

	const commandLine = CommandLine.createNull({ args });

	const wwwServer = HttpServer.createNull();
	const rot13Server = HttpServer.createNull();

	const servers = new AllServers(log, commandLine, wwwServer, rot13Server);
	await servers.startAsync();

	return {
		wwwServer,
		rot13Server,
		wwwRouter: servers.wwwRouter,
		rot13Router: servers.rot13Router,
		logOutput,
	};
}
