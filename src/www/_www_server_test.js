// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const WwwServer = require("./www_server");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");
const Log = require("infrastructure/log");

const PORT = 5000;

describe("WWW server", () => {

	it("routes requests", async () => {
		const { wwwServer } = await startServerAsync();

		const actualResponse = await wwwServer.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await WwwRouter.create().routeAsync(HttpRequest.createNull());
		assert.deepEqual(actualResponse, expectedResponse);
	});

});

async function startServerAsync() {
	const wwwServer = WwwServer.createNull();
	await wwwServer.startAsync(PORT, Log.createNull());
	return {
		wwwServer,
	};
}
