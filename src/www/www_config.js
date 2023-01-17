// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const Log = require("infrastructure/log");

/** Configuration used by all www routes */
module.exports = class WwwConfig {

	static create(log, rot13ServicePort, requestId) {
		ensure.signature(arguments, [ Log, Number, String ]);

		return new WwwConfig(log, rot13ServicePort, requestId);
	}

	static createNull({
		log = Log.createNull(),
		rot13ServicePort = 42,
		requestId = "nulled-request-id"
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			rot13ServicePort: [ undefined, Number ],
			requestId: [ undefined, String ],
		}]]);

		return new WwwConfig(log, rot13ServicePort, requestId);
	}

	constructor(log, rot13ServicePort, requestId) {
		this._log = log;
		this._rot13ServicePort = rot13ServicePort;
		this._requestId = requestId;
	}

	get log() {
		return this._log;
	}

	get rot13ServicePort() {
		return this._rot13ServicePort;
	}

	get requestId() {
		return this._requestId;
	}

};