// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as uuid from "uuid";
import { ConfigurableResponses } from "util/configurable_responses.js";

/** Creates unique IDs. */
export class UuidGenerator {

	/**
	 * Factory method. Creates a generator that returns a unique ID every time it's called.
	 * @returns {UuidGenerator} the generator
	 */
	static create() {
		ensure.signature(arguments, []);

		return new UuidGenerator(uuid);
	}

	/**
	 * Factory method. Creates a simulated generator that returns the specified IDs.
	 * @param [uuids] The IDs to return. If it's an array, the IDs will be returned in order. If it's a single
	 * ID, that ID will be returned indefinitely.
	 * @returns {UuidGenerator} the simulated generator
	 */
	static createNull(uuids = uuid.NIL) {
		ensure.signature(arguments, [[ undefined, String, Array ]]);

		return new UuidGenerator(new StubbedUuid(uuids));
	}

	/** Only for use by tests. (Use a factory method instead.) */
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
