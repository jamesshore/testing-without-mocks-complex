// Copyright Titanium I.T. LLC.
import * as uuid from "uuid";
import { ConfigurableResponses } from "util/configurable_responses.js";

export type NulledUuidGeneratorResponse = string;

export type NulledUuidGeneratorResponses = NulledUuidGeneratorResponse | NulledUuidGeneratorResponse[];

/** Creates unique IDs. */
export class UuidGenerator {

	/**
	 * Factory method. Creates a generator that returns a unique ID every time it's called.
	 * @returns {UuidGenerator} the generator
	 */
	static create(): UuidGenerator {
		return new UuidGenerator(uuid);
	}

	/**
	 * Factory method. Creates a simulated generator that returns the specified IDs.
	 * @param [uuids] The IDs to return. If it's an array, the IDs will be returned in order. If it's a single
	 * ID, that ID will be returned indefinitely.
	 * @returns {UuidGenerator} the simulated generator
	 */
	static createNull(uuids: NulledUuidGeneratorResponses = uuid.NIL) {
		return new UuidGenerator(new StubbedUuid(uuids));
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(private readonly _uuid: Uuid) {
	}

	/**
	 * Create a unique ID.
	 * @returns {string} the ID
	 */
	generate(): string {
		return this._uuid.v4();
	}

}


interface Uuid {
	v4(): string,
}

class StubbedUuid implements Uuid {

	private readonly _responses: ConfigurableResponses<NulledUuidGeneratorResponse>;

	constructor(uuids: NulledUuidGeneratorResponses) {
		this._responses = ConfigurableResponses.create<NulledUuidGeneratorResponse>(uuids, "nulled UUID generator");
	}

	v4() {
		return this._responses.next();
	}

}
