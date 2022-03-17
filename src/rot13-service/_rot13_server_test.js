// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const CommandLine = require("infrastructure/command_line");
const HttpServer = require("./infrastructure/http_server");
const HttpRequest = require("./infrastructure/http_request");
const Server = require("./rot13_server");
const rot13Router = require("./routing/rot13_router");
const Clock = require("infrastructure/clock");

const USAGE = "Usage: serve PORT\n";

describe("ROT-13 Server", function() {

	it("starts server", async function() {
		const { stdout, httpServer } = await startServerAsync({ args: [ "5000" ]});
		assert.equal(httpServer.isStarted, true, "should start server");
		assert.deepEqual(stdout, [ "Server started on port 5000\n" ]);
	});

	it("logs requests", async function() {
		const { stdout, httpServer } = await startServerAsync();
		stdout.consume();

		await httpServer.simulateRequestAsync();
		assert.deepEqual(stdout, [ "Received request\n" ]);
	});

	it("routes requests", async function() {
		const { httpServer, clock } = await startServerAsync();

		const actualResponse = await httpServer.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await rot13Router.routeAsync(HttpRequest.createNull(), clock);
		assert.deepEqual(actualResponse, expectedResponse);
	});


	describe("Command-line processing", function() {

		it("Provides usage and exits with error when no command-line arguments provided", async function() {
			const { stderr } = await startServerAsync({ args: [] });
			assert.deepEqual(stderr, [ USAGE ]);
		});

		it("Provides usage and exits with error when too many command-line arguments provided", async function() {
			const { stderr } = await startServerAsync({ args: ["too", "many"] });
			assert.deepEqual(stderr, [ USAGE ]);
		});

	});

});

async function startServerAsync({ args = [ "4242" ] } = {}) {
	const commandLine = CommandLine.createNull({ args  });
	const httpServer = HttpServer.createNull();

	// Server only works properly when 'now' is an even number. Otherwise, it delays for 30 seconds.
	// This was introduced solely for the purpose of the timeout exercise. The server code is a bit messy as a result.
	// But it is tested. See rot13_router.js and its tests for details.
	const clock = Clock.createNull({ now: 0 });

	const app = new Server(commandLine, httpServer, clock);

	const stdout = commandLine.trackStdout();
	const stderr = commandLine.trackStderr();

	await app.startAsync();

	return {
		httpServer,
		clock,
		stdout,
		stderr,
	};
}
