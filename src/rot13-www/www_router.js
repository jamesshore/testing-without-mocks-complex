// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");

/** Router for user-facing www site */
module.exports = class WwwRouter {

	static create() {
		return new WwwRouter();
	}

	async routeAsync() {
		return await HttpResponse.create({
			status: 501,
			body: "not yet implemented"
		});
	}

};