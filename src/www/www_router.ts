// Copyright Titanium I.T. LLC.
import { HttpServerRequest } from "http/http_server_request.js";
import { HomePageController } from "./home_page/home_page_controller.js";
import * as wwwView from "./www_view.js";
import { GenericRouter } from "http/generic_router.js";
import { WwwConfig } from "./www_config.js";
import { Log } from "infrastructure/log.js";
import { UuidGenerator } from "./infrastructure/uuid_generator.js";
import { HttpServerResponse } from "http/http_server_response.js";
import { Router } from "http/http_server.js";

/** Router for the user-facing website. */
export class WwwRouter implements Router {

	readonly _router: GenericRouter<WwwConfig>;

	/**
	 * Factory method. Creates the router.
	 * @param log logger to use for all requests
	 * @param rot13ServicePort port of the ROT-13 service (host is assumed to be localhost)
	 * @returns {WwwRouter} the router
	 */
	static create(log: Log, rot13ServicePort: number): WwwRouter {
		return new WwwRouter(
			log,
			rot13ServicePort,
			UuidGenerator.create(),
			HomePageController.create(),
		);
	}

	/**
	 * Factory method. Creates a 'nulled' router that doesn't communicate with external systems.
	 * @param [log] logger to use for all requests
	 * @param [port] port of the ROT-13 service (host is assumed to be localhost)
	 * @param [uuids] UUID generator
	 * @returns {WwwRouter} the nulled instance
	 */
	static createNull({
		log = Log.createNull(),
		port = 42,
		uuids = UuidGenerator.createNull(),
	}: {
		log?: Log,
		port?: number,
		uuids?: UuidGenerator,
	} = {}): WwwRouter {
		return new WwwRouter(
			log,
			port,
			uuids,
			HomePageController.createNull(),
		);
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(
		private readonly _log: Log,
		private readonly _rot13ServicePort: number,
		private readonly _uuids: UuidGenerator,
		homePageController: HomePageController,
	) {
		this._router = GenericRouter.create(errorHandler, {
			"/": homePageController,
		});
	}

	/**
	 * @returns {Log} logger
	 */
	get log(): Log {
		return this._log;
	}

	/**
	 * @returns {number} port of the ROT-13 service
	 */
	get rot13ServicePort(): number {
		return this._rot13ServicePort;
	}

	/**
	 * Process request and return response.
	 * @param request the request
	 * @returns {Promise<HttpServerResponse>} the response
	 */
	async routeAsync(request: HttpServerRequest) {
		const correlationId = this._uuids.generate();
		const log = this._log.bind({ correlationId });
		const config = WwwConfig.create(log, this._rot13ServicePort, correlationId);

		return await this._router.routeAsync(request, log, config);
	}

}

function errorHandler(status: number, errorMessage: string, request: HttpServerRequest): HttpServerResponse {
	return wwwView.errorPage(status, errorMessage);
}