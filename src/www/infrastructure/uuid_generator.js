// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const uuid = require("uuid");

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
		this._uuids = uuids;
	}

	v4() {
		if (!Array.isArray(this._uuids)) return this._uuids;

		const result = this._uuids.shift();
		if (result === undefined) throw new Error("No more UUIDs configured in nulled UUID generator");
		return result;
	}

}