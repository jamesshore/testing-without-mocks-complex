// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");
const Log = require("infrastructure/log");
const ServerNode = require("./server_node");
const HttpServer = require("http/http_server");

const PORT = 5000;
const EXAMPLE_HTTP_RESPONSE = HttpResponse.createForTestingOnly();

describe("Server Node", () => {

	it("starts server and provides status", async () => {
		const { serverNode } = await startServerAsync();

		assert.equal(serverNode.isStarted, true, "isStarted");
		assert.equal(serverNode.port, PORT, "port");
	});

	it("simulates and routes requests", async () => {
		const { serverNode } = await startServerAsync();

		const actualResponse = await serverNode.simulateRequestAsync(HttpRequest.createNull());
		assert.deepEqual(actualResponse, EXAMPLE_HTTP_RESPONSE);
	});

});

async function startServerAsync() {
	const serverNode = new ExampleServerNode();
	await serverNode.startAsync(PORT, Log.createNull());
	return {
		serverNode,
	};
}


class ExampleServerNode extends ServerNode {

	constructor() {
		super(HttpServer.createNull(), new ExampleRouter());
	}

}


class ExampleRouter {

	routeAsync(request) {
		return EXAMPLE_HTTP_RESPONSE;
	}

}