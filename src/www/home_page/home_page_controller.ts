// Copyright Titanium I.T. LLC.
import * as homePageView from "./home_page_view.js";
import { Rot13Client } from "../infrastructure/rot13_client.js";
import { HttpServerRequest, FormData } from "http/http_server_request.js";
import { WwwConfig } from "../www_config.js";
import { Clock } from "infrastructure/clock.js";
import { HttpServerResponse } from "http/http_server_response.js";
import { Log } from "infrastructure/log.js";

const ENDPOINT = "/";
const INPUT_FIELD_NAME = "text";
const TIMEOUT_IN_MS = 5000;

/** Endpoint for '/' home page. */
export class HomePageController {

	/**
	 * Factory method. Creates the controller.
	 * @returns {HomePageController} the controller
	 */
	static create(): HomePageController {
		return new HomePageController(Rot13Client.create(), Clock.create());
	}

	/**
	 * Factory method. Creates a 'nulled' controller that doesn't talk to the ROT-13 service.
	 * @returns {HomePageController} the nulled instance
	 */
	static createNull(): HomePageController {
		return new HomePageController(Rot13Client.createNull(), Clock.createNull());
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(private readonly _rot13Client: Rot13Client, private readonly _clock: Clock) {
	}

	/**
	 * Handle GET request.
	 * @param request HTTP request
	 * @param config configuration for this request
	 * @returns {HttpServerResponse} HTTP response
	 */
	async getAsync(request: HttpServerRequest, config: WwwConfig): Promise<HttpServerResponse> {
		return homePageView.homePage();
	}

	/**
	 * Handle POST request.
	 * @param request HTTP request
	 * @param config configuration for this request
	 * @returns {Promise<HttpServerResponse>} HTTP response
	 */
	async postAsync(request: HttpServerRequest, config: WwwConfig): Promise<HttpServerResponse> {
		const log = config.log.bind({ endpoint: ENDPOINT, method: "POST" });

		const { input, inputErr } = parseBody(await request.readBodyAsUrlEncodedFormAsync(), log);
		if (inputErr !== undefined) return homePageView.homePage();

		const { output, outputErr } = await transformAsync(this._rot13Client, this._clock, log, config, input!);
		if (outputErr !== undefined) return homePageView.homePage("ROT-13 service failed");

		return homePageView.homePage(output!);
	}

}

function parseBody(formData: FormData, log: Log): { input?: string, inputErr?: any } {
	try {
		const textFields = formData[INPUT_FIELD_NAME];

		if (textFields === undefined) throw new Error(`'${INPUT_FIELD_NAME}' form field not found`);
		if (textFields.length > 1) throw new Error(`multiple '${INPUT_FIELD_NAME}' form fields found`);

		return { input: textFields[0] };
	}
	catch (inputErr) {
		log.monitor({
			message: "form parse error",
			error: inputErr.message,
			formData,
		});
		return { inputErr };
	}
}

async function transformAsync(
	rot13Client: Rot13Client,
	clock: Clock,
	log: Log,
	config: WwwConfig,
	input: string,
): Promise<{ output?: string, outputErr?: any }> {
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

function timeout(log: Log, cancelFn: () => void): string {
	log.emergency({
		message: "ROT-13 service timed out",
		timeoutInMs: TIMEOUT_IN_MS,
	});
	cancelFn();
	return "ROT-13 service timed out";
}