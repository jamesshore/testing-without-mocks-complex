// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as uuid from "uuid";
import { ConfigurableResponses } from "util/configurable_responses.js";

/** Creates unique IDs. */
export class UuidGenerator {

	/**
	 * Factory method.
	 * @returns {UuidGenerator} the instance
	 */
	static create() {
		ensure.signature(arguments, []);

		return new UuidGenerator(uuid);
	}

	/**
	 * Nulled factory method.
	 * @param [uuids] the UUIDs to return; either a single UUID to return indefinitely, or a list of specific UUIDs
	 * @returns {UuidGenerator} the nulled instance
	 */
	static createNull(uuids = uuid.NIL) {
		ensure.signature(arguments, [[ undefined, String, Array ]]);

		return new UuidGenerator(new StubbedUuid(uuids));
	}

	/** @deprecated Use a factory method instead. */
	constructor(uuid) {
		ensure.signatureMinimum(arguments, [{ v4: Function }]);

		this._uuid = uuid;
	}

	/**
	 * Create a unique ID.
	 * @returns {string} the ID
	 */
	generate() {
		ensure.signature(arguments, []);

		return this._uuid.v4();
	}

}


class StubbedUuid {

	constructor(uuids) {
		this._responses = ConfigurableResponses.create(uuids, "nulled UUID generator");
	}

	v4() {
		return this._responses.next();
	}

}
