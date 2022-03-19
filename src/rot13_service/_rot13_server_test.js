// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpServer = require("http/http_server");
const HttpRequest = require("http/http_request");
const Rot13Server = require("./rot13_server");
const Rot13Router = require("./rot13_router");

const PORT = 5000;

describe("ROT-13 Server", () => {

	it("starts server", async () => {
		const { httpServer } = await startServerAsync();
		assert.equal(httpServer.isStarted, true, "should start server");
		assert.equal(httpServer.port, PORT, "server port");
	});

	it("routes requests", async () => {
		const { httpServer } = await startServerAsync();

		const actualResponse = await httpServer.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await Rot13Router.create().routeAsync(HttpRequest.createNull());
		assert.deepEqual(actualResponse, expectedResponse);
	});

	it("provides server status", async () => {
		const { rot13Server } = await startServerAsync();

		assert.equal(rot13Server.isStarted, true, "isStarted");
		assert.equal(rot13Server.port, PORT, "port");
	});

});

async function startServerAsync() {
	const httpServer = HttpServer.createNull();
	const rot13Server = new Rot13Server(httpServer);

	await rot13Server.startAsync(PORT);

	return {
		httpServer,
		rot13Server,
	};
}
