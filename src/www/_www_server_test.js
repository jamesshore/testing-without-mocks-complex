// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const ensure = require("util/ensure");
const WwwServer = require("./www_server");
const HttpRequest = require("http/http_request");
const WwwRouter = require("./www_router");
const WwwConfig = require("./www_config");
const Log = require("infrastructure/log");

const PORT = 5000;

describe("WWW server", () => {

	it("routes requests", async () => {
		const { wwwServer } = await startServerAsync();

		const actualResponse = await wwwServer.simulateRequestAsync(HttpRequest.createNull());
		const expectedResponse = await WwwRouter.create().routeAsync(HttpRequest.createNull(), WwwConfig.createNull());
		assert.deepEqual(actualResponse, expectedResponse);
	});

	it("creates config", async () => {
		const { wwwServer, log } = await startServerAsync({ rot13ServicePort: 1234 });
		assert.deepEqual(wwwServer.config, WwwConfig.create(log, 1234));
	});

});

async function startServerAsync({
	rot13ServicePort = 0,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		rot13ServicePort: [ undefined, Number ],
	}]]);

	const wwwServer = WwwServer.createNull();
	const log = Log.createNull();
	await wwwServer.startAsync(PORT, log, rot13ServicePort);
	return {
		wwwServer,
		log,
	};
}
