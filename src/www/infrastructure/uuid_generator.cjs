// Copyright Titanium I.T. LLC.
const ensure = require("util/ensure.cjs");
const uuid = require("uuid");
const ConfigurableResponses = require("util/configurable_responses.cjs");

module.exports = class UuidGenerator {

	static create() {
		ensure.signature(arguments, []);

		return new UuidGenerator(uuid);
	}

	static createNull(uuids = uuid.NIL) {
		ensure.signature(arguments, [[ undefined, String, Array ]]);

		return new UuidGenerator(new StubbedUuid(uuids));
	}

	constructor(uuid) {
		ensure.signatureMinimum(arguments, [{ v4: Function }]);

		this._uuid = uuid;
	}

	generate() {
		ensure.signature(arguments, []);

		return this._uuid.v4();
	}

};


class StubbedUuid {

	constructor(uuids) {
		this._responses = ConfigurableResponses.create(uuids, "nulled UUID generator");
	}

	v4() {
		return this._responses.next();
	}

}
