// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const WwwServer = require("./www/www_server");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www/www_router");
const Log = require("infrastructure/log");

const PORT = 5000;

describe("Server Node", () => {

	it("starts server and provides status", async () => {
		const { serverNode } = await startServerAsync();

		assert.equal(serverNode.isStarted, true, "isStarted");
		assert.equal(serverNode.port, PORT, "port");
	});

	it("routes requests", async () => {
		const { serverNode } = await startServerAsync();

		const actualResponse = await serverNode.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await WwwRouter.create().routeAsync(HttpRequest.createNull());
		assert.deepEqual(actualResponse, expectedResponse);
	});

});

async function startServerAsync() {
	const serverNode = WwwServer.createNull();
	await serverNode.startAsync(PORT, Log.createNull());
	return {
		serverNode,
	};
}
