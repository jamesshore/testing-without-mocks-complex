// Copyright Titanium I.T. LLC.
import { Log } from "infrastructure/log.js";

/** Configuration for a request to the user-facing website. */
export class WwwConfig {

	/**
	 * Factory method. Creates the configuration.
	 * @param log logger to use for this request
	 * @param rot13ServicePort port of ROT-13 service (host is assumed to be localhost)
	 * @param correlationId unique identifier for this request
	 * @returns {WwwConfig} the configuration
	 */
	static create(log: Log, rot13ServicePort: number, correlationId: string): WwwConfig {
		return new WwwConfig(log, rot13ServicePort, correlationId);
	}

	/**
	 * Test-only factory method. Creates a configuration with overrideable defaults.
	 * @param [log] logger to use for this request
	 * @param [rot13ServicePort] port of ROT-13 service (host is assumed to be localhost)
	 * @param [correlationId] unique identifier for this request
	 * @returns {WwwConfig} the configuration
	 */
	static createTestInstance({
		log = Log.createNull(),
		rot13ServicePort = 42,
		correlationId = "nulled-correlation-id"
	}: {
		log?: Log,
		rot13ServicePort?: number,
		correlationId?: string,
	} = {}): WwwConfig {
		return new WwwConfig(log, rot13ServicePort, correlationId);
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(
		private readonly _log: Log,
		private readonly _rot13ServicePort: number,
		private readonly _correlationId: string,
	) {
	}

	/**
	 * @returns {Log} logger
	 */
	get log(): Log {
		return this._log;
	}

	/**
	 * @returns {number} port of ROT-13 service
	 */
	get rot13ServicePort(): number {
		return this._rot13ServicePort;
	}

	/**
	 * @returns {string} unique identifier for this request
	 */
	get correlationId(): string {
		return this._correlationId;
	}

}