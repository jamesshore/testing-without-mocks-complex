// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const http = require("http");
const EventEmitter = require("events");
const infrastructureHelper = require("util/infrastructure_helper");

const REQUEST_EVENT = "request";

/** Generic HTTP client */
module.exports = class HttpClient {

	static create() {
		ensure.signature(arguments, []);
		return new HttpClient(http);
	}

	static createNull(responses) {
		return new HttpClient(new NullHttp(responses));
	}

	constructor(http) {
		this._http = http;
		this._emitter = new EventEmitter();
	}

	request({ host, port, method, path, headers = {}, body = "" }) {
		ensure.signature(arguments, [{
			host: String,
			port: Number,
			method: String,
			path: String,
			headers: [ undefined, Object ],
			body: [ undefined, String ],
		}]);
		if (method === "GET" && body !== "") throw new Error("Don't include body with GET requests; Node won't send it");

		let cancelFn;
		let cancellable = true;
		const responsePromise = new Promise((resolve, reject) => {
			const request = this._http.request({ host, port, method, path, headers });
			const requestData = { host, port, method: method.toLowerCase(), path, headers: normalizeHeaders(headers), body };
			this._emitter.emit(REQUEST_EVENT, requestData);

			cancelFn = (message) => {
				if (!cancellable) return false;

				request.destroy(new Error(message));
				this._emitter.emit(REQUEST_EVENT, { ...requestData, cancelled: true });
				cancellable = false;
				return true;
			};

			request.once("error", reject);
			request.once("response", (response) => {
				const headers = { ...response.headers };
				delete headers.connection;
				delete headers["content-length"];
				delete headers.date;

				let body = "";
				response.on("data", (chunk) => {
					body += chunk;
				});
				response.on("end", () => {
					cancellable = false;
					resolve({
						status: response.statusCode,
						headers,
						body,
					});
				});
			});

			request.end(body);
		});

		return { responsePromise, cancelFn };
	}

	trackRequests() {
		ensure.signature(arguments, []);
		return infrastructureHelper.trackOutput(this._emitter, REQUEST_EVENT);
	}

};

function normalizeHeaders(headers) {
	const normalized = Object.entries(headers).map(([ key, value ]) => [ key.toLowerCase(), value ]);
	return Object.fromEntries(normalized);
}


class NullHttp {

	constructor(responses = {}) {
		ensure.signature(responses, [[ undefined, Object ]]);

		this._responses = responses;
	}

	request({ path }) {
		return new NullRequest(this._responses[path]);
	}

}

class NullRequest extends EventEmitter {

	constructor(endpointResponses = []) {
		super();
		ensure.signature(arguments, [[ undefined, Array ]], [ "endpoint_responses"]);

		this._endpointResponses = endpointResponses;
	}

	end() {
		setImmediate(() => {
			this.emit("response", new NullResponse(this._endpointResponses.shift()));
		});
	}

	destroy(error) {
		setImmediate(() => {
			this.emit("error", error);
		});
	}

}

class NullResponse extends EventEmitter {

	constructor({ status = 501, headers = {}, body = "", hang = false} = {
		status: 503,
		headers: { NullHttpClient: "default header" },
		body: "Null HttpClient default response",
		hang: false,
	}) {
		super();
		ensure.signature(arguments, [[ undefined, {
			status: [ undefined, Number ],
			headers: [ undefined, Object ],
			body: [ undefined, String ],
			hang: [ undefined, Boolean ],
		}]], [ "response" ]);

		this._status = status;
		this._headers = normalizeHeaders(headers);

		setImmediate(() => {
			this.emit("data", body);
			if (!hang) this.emit("end");
		});
	}

	get statusCode() {
		return this._status;
	}

	get headers() {
		return this._headers;
	}

}