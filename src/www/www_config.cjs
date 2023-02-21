// Copyright Titanium I.T. LLC.
const ensure = require("util/ensure");
const Log = require("infrastructure/log");

/** Configuration used by all website routes */
module.exports = class WwwConfig {

	static create(log, rot13ServicePort, correlationId) {
		ensure.signature(arguments, [ Log, Number, String ]);

		return new WwwConfig(log, rot13ServicePort, correlationId);
	}

	static createTestInstance({
		log = Log.createNull(),
		rot13ServicePort = 42,
		correlationId = "nulled-correlation-id"
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			rot13ServicePort: [ undefined, Number ],
			correlationId: [ undefined, String ],
		}]]);

		return new WwwConfig(log, rot13ServicePort, correlationId);
	}

	constructor(log, rot13ServicePort, correlationId) {
		this._log = log;
		this._rot13ServicePort = rot13ServicePort;
		this._correlationId = correlationId;
	}

	get log() {
		return this._log;
	}

	get rot13ServicePort() {
		return this._rot13ServicePort;
	}

	get correlationId() {
		return this._correlationId;
	}

};