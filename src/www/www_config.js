// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const Log = require("infrastructure/log");

/** Configuration used by all routes */
module.exports = class WwwConfig {

	static create(log, rot13ServicePort) {
		ensure.signature(arguments, [ Log, Number ]);

		return new WwwConfig(log, rot13ServicePort);
	}

	static createNull({
		log = Log.createNull(),
		rot13ServicePort = 42,
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			rot13ServicePort: [ undefined, Number ],
		}]]);

		return new WwwConfig(log, rot13ServicePort);
	}

	constructor(log, rot13ServicePort) {
		this._log = log;
		this._rot13ServicePort = rot13ServicePort;
	}

	get rot13ServicePort() {
		return this._rot13ServicePort;
	}

};