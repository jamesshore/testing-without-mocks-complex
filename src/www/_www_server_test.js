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

	it("provides server status", async () => {
		const { wwwServer } = await startServerAsync();

		assert.equal(wwwServer.isStarted, true, "isStarted");
		assert.equal(wwwServer.port, PORT, "port");
	});

});

async function startServerAsync() {
	const httpServer = HttpServer.createNull();
	const wwwServer = new WwwServer(httpServer);

	await wwwServer.startAsync(PORT);

	return {
		httpServer,
		wwwServer,
	};
}
