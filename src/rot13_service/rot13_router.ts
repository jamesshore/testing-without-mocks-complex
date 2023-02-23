// Copyright Titanium I.T. LLC.
import { HttpServerRequest } from "http/http_server_request.js";
import { GenericRouter } from "http/generic_router.js";
import { Rot13Controller } from "./rot13_controller.js";
import { Log } from "infrastructure/log.js";
import * as rot13View from "./rot13_view.js";
import { Router } from "http/http_server.js";
import { HttpServerResponse } from "http/http_server_response.js";

/** Router for ROT-13 service */
export class Rot13Router implements Router {

	private readonly _router: GenericRouter<void>;

	/**
	 * Factory method. Creates the router.
	 * @param log logger to use for all requests
	 * @returns {Rot13Router} the router
	 */
	static create(log: Log): Rot13Router {
		return new Rot13Router(log);
	}

	/**
	 * Factory method. Creates a 'nulled' router that doesn't communicate with external systems.
	 * @param [log] logger to use for all requests (defaults to a nulled log)
	 * @returns {Rot13Router} the nulled instance
	 */
	static createNull({
		log = Log.createNull(),
	}: {
		log?: Log,
	} = {}): Rot13Router {
		return new Rot13Router(log);
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(private readonly _log: Log) {
		this._router = GenericRouter.create(errorHandler, {
			"/rot13/transform": Rot13Controller.create(),
		});
	}

	/**
	 * @returns {*} logger
	 */
	get log(): Log {
		return this._log;
	}

	/**
	 * Process request and return response.
	 * @param request the request
	 * @returns {Promise<HttpServerResponse>} the response
	 */
	async routeAsync(request: HttpServerRequest): Promise<HttpServerResponse> {
		const correlationId = request.headers["x-correlation-id"];
		if (correlationId === undefined) {
			return rot13View.error(400, "missing x-correlation-id header");
		}

		const log = this._log.bind({ correlationId });
		return await this._router.routeAsync(request, log);
	}

}

function errorHandler(status: number, error: string, request: HttpServerRequest): HttpServerResponse {
	return rot13View.error(status, error);
}