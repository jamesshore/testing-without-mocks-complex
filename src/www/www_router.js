// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import { HttpServerRequest } from "http/http_server_request.js";
import { HomePageController } from "./home_page/home_page_controller.js";
import * as wwwView from "./www_view.js";
import { GenericRouter } from "http/generic_router.js";
import { WwwConfig } from "./www_config.js";
import { Log } from "infrastructure/log.js";
import { UuidGenerator } from "./infrastructure/uuid_generator.js";

/** Router for the user-facing website. */
export class WwwRouter {

	/**
	 * Factory method.
	 * @param log logger to use for all requests
	 * @param rot13ServicePort port of the ROT-13 service (host is assumed to be localhost)
	 * @returns {WwwRouter} the instance
	 */
	static create(log, rot13ServicePort) {
		ensure.signature(arguments, [ Log, Number ]);

		return new WwwRouter(
			log,
			rot13ServicePort,
			UuidGenerator.create(),
			HomePageController.create(),
		);
	}

	/**
	 * Nulled factory method.
	 * @param [log] logger to use for all requests
	 * @param [port] port of the ROT-13 service (host is assumed to be localhost)
	 * @param [uuids] UUID generator
	 * @returns {WwwRouter} the nulled instance
	 */
	static createNull({
		log = Log.createNull(),
		port = 42,
		uuids = UuidGenerator.createNull(),
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			port: [ undefined, Number ],
			uuids: [ undefined, UuidGenerator ],
		}]]);

		return new WwwRouter(
			log,
			port,
			uuids,
			HomePageController.createNull(),
		);
	}

	/** @deprecated Use a factory method instead. */
	constructor(log, rot13ServicePort, uuids, homePageController) {
		ensure.signature(arguments, [ Log, Number, UuidGenerator, HomePageController ]);

		this._log = log;
		this._rot13ServicePort = rot13ServicePort;
		this._uuids = uuids;

		this._router = GenericRouter.create(errorHandler, {
			"/": homePageController,
		});
	}

	/**
	 * @returns {Log} logger
	 */
	get log() {
		return this._log;
	}

	/**
	 * @returns {number} port of the ROT-13 service
	 */
	get rot13ServicePort() {
		return this._rot13ServicePort;
	}

	/**
	 * Process request and return response.
	 * @param request the request
	 * @returns {Promise<HttpServerResponse>} the response
	 */
	async routeAsync(request) {
		ensure.signature(arguments, [ HttpServerRequest ]);

		const correlationId = this._uuids.generate();
		const log = this._log.bind({ correlationId });
		const config = WwwConfig.create(log, this._rot13ServicePort, correlationId);

		return await this._router.routeAsync(request, log, config);
	}

}

function errorHandler(status, errorMessage, request) {
	ensure.signature(arguments, [ Number, String, HttpServerRequest ]);

	return wwwView.errorPage(status, errorMessage);
}