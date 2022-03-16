// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpClient = require("./http_client");
const Rot13Client = require("./rot13_client");
const testHelper = require("util/test_helper");

const HOST = "localhost";
const IRRELEVANT_PORT = 42;
const IRRELEVANT_TEXT = "irrelevant text";

const VALID_STATUS = 200;
const VALID_HEADERS = { "content-type": "application/json" };
const VALID_BODY_TEXT = "transformed_text";
const VALID_BODY = JSON.stringify({ transformed: VALID_BODY_TEXT });

describe("ROT-13 Service client", function() {

	describe("happy path", function() {

		it("makes request", async function() {
			const { httpRequests, rot13Client } = createClient();

			await transformAsync(rot13Client, 9999, "text_to_transform");

			assert.deepEqual(httpRequests, [{
				host: HOST,
				port: 9999,
				path: "/rot13/transform",
				method: "post",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ text: "text_to_transform" }),
			}]);
		});

		it("parses response", async function() {
			const { rot13Client } = createClient({
				status: VALID_STATUS,
				headers: VALID_HEADERS,
				body: VALID_BODY,
			});

			const response = await transformAsync(rot13Client, IRRELEVANT_PORT, IRRELEVANT_TEXT);
			assert.equal(response, VALID_BODY_TEXT);
		});

		it("tracks requests", async function() {
			const { rot13Client } = createClient();
			const requests = rot13Client.trackRequests();

			await transformAsync(rot13Client, 9999, "my text");
			assert.deepEqual(requests, [{
				port: 9999,
				text: "my text",
			}]);
		});

	});


	describe("failure paths", function() {

		it("fails gracefully when status code has unexpected value", async function() {
			await assertFailureAsync({
				status: 400,
				message: "Unexpected status from ROT-13 service",
			});
		});

		it("fails gracefully if body doesn't exist", async function() {
			await assertFailureAsync({
				body: "",
				message: "Body missing from ROT-13 service",
			});
		});

		it("fails gracefully if body is unparseable", async function() {
			await assertFailureAsync({
				body: "xxx",
				message: "Unparseable body from ROT-13 service: Unexpected token x in JSON at position 0",
			});
		});

		it("fails gracefully if body has unexpected value", async function() {
			await assertFailureAsync({
				body: JSON.stringify({ foo: "bar" }),
				message: "Unexpected body from ROT-13 service: body.transformed must be a string, but it was undefined",
			});
		});

		it("doesn't fail when body has more fields than we expect", async function() {
			const { rot13Client } = createClient({
				body: JSON.stringify({ transformed: "response", foo: "bar" }),
			});
			await assert.doesNotThrowAsync(
				() => transformAsync(rot13Client, IRRELEVANT_PORT, IRRELEVANT_TEXT),
			);
		});

	});


	describe("cancellation", function() {

		it("can cancel requests", async function() {
			const { rot13Client, httpRequests } = createClient({ hang: true });
			const { transformPromise, cancelFn } = rot13Client.transform(9999, "text_to_transform");

			cancelFn();

			assert.deepEqual(httpRequests, [
				{
					host: HOST,
					port: 9999,
					path: "/rot13/transform",
					method: "post",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ text: "text_to_transform" }),
				},
				{
					host: HOST,
					port: 9999,
					path: "/rot13/transform",
					method: "post",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ text: "text_to_transform" }),
					cancelled: true,
				},
			]);
			await assert.throwsAsync(
				() => transformPromise,
				"ROT-13 service request cancelled\n" +
				`Host: ${HOST}:9999\n` +
				"Endpoint: /rot13/transform"
			);
		});

		it("tracks requests that are cancelled", async function() {
			const { rot13Client } = createClient({ hang: true });
			const requests = rot13Client.trackRequests();
			const { transformPromise, cancelFn } = rot13Client.transform(9999, "my text");

			cancelFn();
			assert.deepEqual(requests, [
				{
					port: 9999,
					text: "my text",
				},
				{
					port: 9999,
					text: "my text",
					cancelled: true,
				},
			]);

			await testHelper.ignorePromiseErrorAsync(transformPromise);
		});

		it("doesn't track cancellations that happen after response received", async function() {
			const { rot13Client } = createClient();
			const requests = rot13Client.trackRequests();
			const { transformPromise, cancelFn } = rot13Client.transform(9999, "my text");

			await transformPromise;
			cancelFn();

			assert.deepEqual(requests, [
				{
					port: 9999,
					text: "my text",
				},
			]);
		});

	});


	describe("nullability", function() {

		it("provides default response", async function() {
			const rot13Client = Rot13Client.createNull();
			const response = await transformAsync(rot13Client, IRRELEVANT_PORT, IRRELEVANT_TEXT);
			assert.equal(response, "Null Rot13Client response");
		});

		it("can configure multiple responses", async function() {
			const rot13Client = Rot13Client.createNull([
				{ response: "response 1" },
				{ response: "response 2" },
			]);

			const response1 = await transformAsync(rot13Client, IRRELEVANT_PORT, IRRELEVANT_TEXT);
			const response2 = await transformAsync(rot13Client, IRRELEVANT_PORT, IRRELEVANT_TEXT);

			assert.equal(response1, "response 1");
			assert.equal(response2, "response 2");
		});

		it("can force an error", async function() {
			const rot13Client = Rot13Client.createNull([{ error: "my error" }]);
			await assert.throwsAsync(
				() => transformAsync(rot13Client, IRRELEVANT_PORT, IRRELEVANT_TEXT),
				/my error/
			);
		});

		it("simulates hangs", async function() {
			const rot13Client = Rot13Client.createNull([{ hang: true }]);
			const { transformPromise } = rot13Client.transform(IRRELEVANT_PORT, IRRELEVANT_TEXT);
			await assert.promiseDoesNotResolveAsync(transformPromise);
		});

	});

});

function createClient({
	status = VALID_STATUS,
	headers = VALID_HEADERS,
	body = VALID_BODY,
} = {}) {
	const httpClient = HttpClient.createNull({
		"/rot13/transform": [{ status, headers, body }],
	});
	const httpRequests = httpClient.trackRequests();

	const rot13Client = new Rot13Client(httpClient);
	return { httpRequests, rot13Client };
}

async function transformAsync(rot13Client, port, text) {
	return await rot13Client.transform(port, text).transformPromise;
}

async function assertFailureAsync({
	status = VALID_STATUS,
	headers = VALID_HEADERS,
	body = VALID_BODY,
	message,
} = {}) {
	const { rot13Client } = createClient({ status, headers, body });
	await assert.throwsAsync(
		() => transformAsync(rot13Client, 9999, IRRELEVANT_TEXT),
		`${message}\n` +
		`Host: ${HOST}:9999\n` +
		"Endpoint: /rot13/transform\n" +
		`Status: ${status}\n` +
		`Headers: ${JSON.stringify(headers)}\n` +
		`Body: ${body}`
	);
}
