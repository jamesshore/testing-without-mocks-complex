// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpServer = require("./http_server");
const testHelper = require("util/test_helper");
const HttpRequest = require("./http_request");
const Log = require("infrastructure/log");

const PORT = 5001;

describe("HTTP Server", function() {

	describe("starting and stopping", function() {

		it("starts and stops server (and can do so multiple times)", async function() {
			const { server } = createServer();

			await startAsync(server);
			await stopAsync(server);
			await startAsync(server);
			await stopAsync(server);
		});

		it("says if the server is started", async function() {
			const { server } = createServer();
			assert.equal(server.isStarted, false, "before server started");
			await startAsync(server);
			try {
				assert.equal(server.isStarted, true, "after server started");
			}
			finally {
				await stopAsync(server);
				assert.equal(server.isStarted, false, "after server stopped");
			}
		});

		it("fails gracefully if server has startup error", async function() {
			await startAndStopAsync({}, async () => {
				const { server } = createServer();
				await assert.throwsAsync(
					() => startAsync(server),     // fails because another server is already running
					/^Couldn't start server due to error:.*?EADDRINUSE/
				);
			});
		});

		it("fails fast if server is started twice", async function() {
			await startAndStopAsync({}, async ({ server }) => {
				await assert.throwsAsync(
					() => startAsync(server),
					"Can't start server because it's already running"
				);
			});
		});

		it("fails fast if server is stopped when it isn't running", async function() {
			const { server } = createServer();
			await assert.throwsAsync(
				() => stopAsync(server),
				"Can't stop server because it isn't running"
			);
		});

	});


	describe("requests and responses", function() {

		it("runs a function when a request is received and serves the result", async function() {
			const expectedResponse = {
				status: 777,
				headers: {
					header1: "value1",
					header2: "value2",
				},
				body: "my body",
			};
			function onRequestAsync() { return expectedResponse; }

			const { response } = await getAsync({ onRequestAsync });
			assert.deepEqual(response, expectedResponse);
		});

		it("provides request object to request handler", async function() {
			let actualRequest;
			function onRequestAsync(request) {
				actualRequest = request;
			}

			const { response } = await getAsync({ onRequestAsync });
			assert.instanceOf(actualRequest, HttpRequest);
		});

		it("simulates requests", async function() {
			let actualRequest;
			const expectedResponse = {
				status: 777,
				headers: { myheader: "myvalue" },
				body: "my body"
			};
			function onRequestAsync(request) {
				actualRequest = request;
				return expectedResponse;
			}

			const server = HttpServer.createNull();
			await startAsync(server, { onRequestAsync });

			const expectedRequest = HttpRequest.createNull();
			const response = await server.simulateRequestAsync(expectedRequest);

			assert.equal(actualRequest, expectedRequest);
			assert.deepEqual(response, expectedResponse);
		});

		it("simulating requests fails fast when server isn't running", async function() {
			const server = HttpServer.createNull();
			await assert.throwsAsync(
				() => server.simulateRequestAsync(),
				"Can't simulate request because server isn't running"
			);
		});

		it("fails gracefully when request handler throws exception", async function() {
			function onRequestAsync() { throw new Error("onRequestAsync error"); }

			const { response, logOutput } = await getAsync({ onRequestAsync });
			assert.deepEqual(logOutput, [{
				alert: Log.EMERGENCY,
				message: "request handler threw exception",
				error: "Error: onRequestAsync error",
			}]);
			assert.deepEqual(response, {
				status: 500,
				headers: { "content-type": "text/plain; charset=utf-8" },
				body: "Internal Server Error",
			});
		});

		it("fails gracefully when request handler returns invalid response", async function() {
			function onRequestAsync() { return "my invalid response"; }

			const { response, logOutput } = await getAsync({ onRequestAsync });
			assert.deepEqual(logOutput, [{
				alert: Log.EMERGENCY,
				message: "request handler returned invalid response",
				response: "my invalid response",
			}]);
			assert.deepEqual(response, {
				status: 500,
				headers: { "content-type": "text/plain; charset=utf-8" },
				body: "Internal Server Error",
			});
		});

	});


	describe("nullability", function() {

		it("doesn't actually start or stop the server", async function() {
			const server = HttpServer.createNull();
			const server2 = HttpServer.createNull();

			await startAsync(server);
			await assert.doesNotThrowAsync(
				() => startAsync(server2)     // fails if server is real because address is already in use
			);
			await stopAsync(server);
		});

	});

});


async function getAsync({ onRequestAsync }) {
	return await startAndStopAsync({ onRequestAsync }, async ({ logOutput }) => {
		return {
			response: await testHelper.requestAsync({ port: PORT }),
			logOutput,
		};
	});
}

async function startAndStopAsync(options, fnAsync) {
	const { server, logOutput } = createServer();
	await startAsync(server, options);
	try {
		return await fnAsync({ server, logOutput });
	}
	finally {
		await stopAsync(server);
	}
}

async function startAsync(server, {
	onRequestAsync = () => {},
} = {}) {
	await server.startAsync({ port: PORT, onRequestAsync });
}

async function stopAsync(server) {
	await server.stopAsync();
}

function createServer() {
	const log = Log.createNull();
	const server = HttpServer.create(log);
	return { server, logOutput: log.trackOutput() };
}