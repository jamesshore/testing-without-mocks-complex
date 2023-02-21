// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.mjs";
import * as homePageView from "./home_page_view.js";
import { Rot13Client } from "../infrastructure/rot13_client.js";
import { HttpRequest } from "http/http_request.mjs";
import { WwwConfig } from "../www_config.js";
import { Clock } from "infrastructure/clock.mjs";

const ENDPOINT = "/";
const INPUT_FIELD_NAME = "text";
const TIMEOUT_IN_MS = 5000;

/** Endpoints for / (home page) */
export class HomePageController {

	static create() {
		ensure.signature(arguments, []);
		return new HomePageController(Rot13Client.create(), Clock.create());
	}

	static createNull() {
		ensure.signature(arguments, []);
		return new HomePageController(Rot13Client.createNull(), Clock.createNull());
	}

	constructor(rot13Client, clock) {
		ensure.signature(arguments, [ Rot13Client, Clock ]);

		this._rot13Client = rot13Client;
		this._clock = clock;
	}

	getAsync(request, config) {
		ensure.signature(arguments, [ HttpRequest, WwwConfig ]);

		return homePageView.homePage();
	}

	async postAsync(request, config) {
		ensure.signature(arguments, [ HttpRequest, WwwConfig ]);

		const log = config.log.bind({ endpoint: ENDPOINT, method: "POST" });

		const { input, inputErr } = parseBody(await request.readBodyAsync(), log);
		if (inputErr !== undefined) return homePageView.homePage();

		const { output, outputErr } = await transformAsync(this._rot13Client, this._clock, log, config, input);
		if (outputErr !== undefined) return homePageView.homePage("ROT-13 service failed");

		return homePageView.homePage(output);
	}

}

function parseBody(body, log) {
	try {
		const params = new URLSearchParams(body);
		const textFields = params.getAll(INPUT_FIELD_NAME);

		if (textFields.length === 0) throw new Error(`'${INPUT_FIELD_NAME}' form field not found`);
		if (textFields.length > 1) throw new Error(`multiple '${INPUT_FIELD_NAME}' form fields found`);

		return { input: textFields[0] };
	}
	catch (inputErr) {
		log.monitor({
			message: "form parse error",
			error: inputErr.message,
			body,
		});
		return { inputErr };
	}
}

async function transformAsync(rot13Client, clock, log, config, input) {
	try {
		const { transformPromise, cancelFn } = rot13Client.transform(config.rot13ServicePort, input, config.correlationId);
		const output = await clock.timeoutAsync(
			TIMEOUT_IN_MS,
			transformPromise,
			() => timeout(log, cancelFn));
		return { output };
	}
	catch (outputErr) {
		log.emergency({
			message: "ROT-13 service error",
			error: outputErr,
		});
		return { outputErr };
	}
}

function timeout(log, cancelFn) {
	log.emergency({
		message: "ROT-13 service timed out",
		timeoutInMs: TIMEOUT_IN_MS,
	});
	cancelFn();
	return "ROT-13 service timed out";
}