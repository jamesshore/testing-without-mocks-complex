// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const WwwServer = require("./www_server");
const HttpServer = require("http/http_server");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");

const PORT = 5000;

describe("WWW server", () => {

	it("starts server", async () => {
		const { httpServer } = await startServerAsync();
		assert.equal(httpServer.isStarted, true, "should start server");
		assert.equal(httpServer.port, PORT, "server port");
	});

	it("routes requests", async () => {
		const { httpServer } = await startServerAsync();

		const actualResponse = await httpServer.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await WwwRouter.create().routeAsync(HttpRequest.createNull());
		assert.deepEqual(actualResponse, expectedResponse);
	});

});

async function startServerAsync() {
	const httpServer = HttpServer.createNull();
	const wwwServer = new WwwServer(httpServer);

	await wwwServer.serveAsync(PORT);

	return {
		httpServer,
	};
}




// describe("ROT-13 CLI", () => {
//
// 	it("calls ROT-13 service", async () => {
// 		const { rot13Requests, clock, stdout } = await runAsync({
// 			args: VALID_ARGS,
// 			rot13Response: "transformed text",
// 		});
//
// 		assert.deepEqual(rot13Requests, [{
// 			port: VALID_PORT,
// 			text: VALID_TEXT,
// 		}]);
// 		assert.deepEqual(stdout, [ "transformed text\n" ]);
//
// 		await clock.advanceNullTimersAsync();
// 		assert.equal(clock.now(), 0);
// 	});
//
// 	it("outputs an error when ROT-13 service fails", async () => {
// 		const { stderr } = await runAsync({
// 			args: VALID_ARGS,
// 			rot13Error: "my error",
// 		});
//
// 		assert.equal(stderr[0], "ROT-13 service failed:\n");
// 		assert.match(stderr[1], /my error/);
// 	});
//
// 	it("times out ROT-13 service when service responds too slowly", async () => {
// 		const { runPromise, rot13Requests, clock, stderr } = run({
// 			args: VALID_ARGS,
// 			rot13Hang: true,
// 		});
//
// 		await clock.advanceNullAsync(TIMEOUT_IN_MS);
// 		await assert.promiseResolvesAsync(runPromise);
// 		assert.deepEqual(rot13Requests, [
// 			{
// 				port: VALID_PORT,
// 				text: VALID_TEXT,
// 			},
// 			{
// 				port: VALID_PORT,
// 				text: VALID_TEXT,
// 				cancelled: true,
// 			},
// 		]);
// 		assert.deepEqual(stderr, [
// 			"ROT-13 service failed:\n",
// 			"Service timed out.\n",
// 		]);
// 	});
//
// 	it("writes usage to command-line when arguments not provided", async () => {
// 		const { stderr } = await runAsync({ args: [] });
// 		assert.deepEqual(stderr, [ "Usage: run PORT TEXT\n" ]);
// 	});
//
// });
//
// async function runAsync(options) {
// 	const results = run(options);
// 	await results.runPromise;
// 	return results;
// }
//
// function run({ args, rot13Response, rot13Error, rot13Hang }) {
// 	const commandLine = CommandLine.createNull({ args });
// 	const stdout = commandLine.trackStdout();
// 	const stderr = commandLine.trackStderr();
//
// 	const rot13Client = Rot13Client.createNull([{ response: rot13Response, error: rot13Error, hang: rot13Hang }]);
// 	const rot13Requests = rot13Client.trackRequests();
//
// 	const clock = Clock.createNull();
//
// 	const runPromise = server.runAsync({ commandLine, rot13Client, clock });
//
// 	return { runPromise, stdout, stderr, rot13Requests, clock };
// }