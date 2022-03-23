// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpRequest = require("http/http_request");
const Rot13Server = require("./rot13_server");
const Rot13Router = require("./rot13_router");
const Log = require("infrastructure/log");

const PORT = 5000;

describe("ROT-13 Server", () => {

	it("routes requests", async () => {
		const { rot13Server } = await startServerAsync();

		const actualResponse = await rot13Server.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await Rot13Router.create().routeAsync(HttpRequest.createNull());
		assert.deepEqual(actualResponse, expectedResponse);
	});

});

async function startServerAsync() {
	const rot13Server = Rot13Server.createNull();
	await rot13Server.startAsync(PORT, Log.createNull());
	return {
		rot13Server,
	};
}
