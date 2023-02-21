// Copyright Titanium I.T. LLC.
const ensure = require("util/ensure");
const assert = require("util/assert");
const HttpClient = require("http/http_client");
const Rot13Client = require("./rot13_client.cjs");
const testHelper = require("util/test_helper");

const HOST = "localhost";
const IRRELEVANT_PORT = 42;
const IRRELEVANT_TEXT = "irrelevant text";
const IRRELEVANT_CORRELATION_ID = "irrelevant correlation-id";

const VALID_ROT13_STATUS = 200;
const VALID_ROT13_HEADERS = { "content-type": "application/json" };
const VALID_RESPONSE = "transformed_text";
const VALID_ROT13_BODY = JSON.stringify({ transformed: VALID_RESPONSE });

describe("ROT-13 Service client", () => {

	describe("happy path", () => {

		it("makes request", async () => {
			const { httpRequests } = await transformAsync({
				port: 9999,
				text: "text_to_transform",
				correlationId: "my-correlation-id"
			});

			assert.deepEqual(httpRequests.data, [{
				host: HOST,
				port: 9999,
				path: "/rot13/transform",
				method: "post",
				headers: {
					"content-type": "application/json",
					"x-correlation-id": "my-correlation-id",
				},
				body: JSON.stringify({ text: "text_to_transform" }),
			}]);
		});

		it("parses response", async () => {
			const { response } = await transformAsync({
				rot13ServiceStatus: VALID_ROT13_STATUS,
				rot13ServiceHeaders: VALID_ROT13_HEADERS,
				rot13ServiceBody: VALID_ROT13_BODY,
			});

			assert.equal(response, VALID_RESPONSE);
		});

		it("tracks requests", async () => {
			const { requests } = await transformAsync({
				port: 9999,
				text: "my text",
				correlationId: "my-correlation-id"
			});

			assert.deepEqual(requests.data, [{
				port: 9999,
				text: "my text",
				correlationId: "my-correlation-id",
			}]);
		});

	});


	describe("failure paths", () => {

		it("fails gracefully when status code has unexpected value", async () => {
			await assertFailureAsync({
				rot13ServiceStatus: 400,
				message: "Unexpected status from ROT-13 service",
			});
		});

		it("fails gracefully if body doesn't exist", async () => {
			await assertFailureAsync({
				rot13ServiceBody: "",
				message: "Body missing from ROT-13 service",
			});
		});

		it("fails gracefully if body is unparseable", async () => {
			await assertFailureAsync({
				rot13ServiceBody: "xxx",
				message: "Unparseable body from ROT-13 service: Unexpected token x in JSON at position 0",
			});
		});

		it("fails gracefully if body has unexpected value", async () => {
			await assertFailureAsync({
				rot13ServiceBody: JSON.stringify({ foo: "bar" }),
				message: "Unexpected body from ROT-13 service: body.transformed must be a string, but it was undefined",
			});
		});

		it("doesn't fail when body has more fields than we expect", async () => {
			const rot13ServiceBody = JSON.stringify({ transformed: "response", foo: "bar" });
			await assert.doesNotThrowAsync(
				() => transformAsync({ rot13ServiceBody }),
			);
		});

	});


	describe("cancellation", () => {

		it("can cancel requests", async () => {
			const { responsePromise, cancelFn, httpRequests } = transform({
				port: 9999,
				text: "text_to_transform",
				correlationId: "my-correlation-id",
				rot13ServiceHang: true,
			});
			const expectedRequest = {
				host: HOST,
				port: 9999,
				path: "/rot13/transform",
				method: "post",
				headers: {
					"content-type": "application/json",
					"x-correlation-id": "my-correlation-id",
				},
				body: JSON.stringify({ text: "text_to_transform" }),
			};

			cancelFn();

			assert.deepEqual(httpRequests.data, [
				expectedRequest,
				{ ...expectedRequest, cancelled: true },
			], "should cancel request");
			await assert.throwsAsync(
				() => responsePromise,
				"ROT-13 service request cancelled\n" +
					`Host: ${HOST}:9999\n` +
					"Endpoint: /rot13/transform",
				"should throw exception",
			);
		});

		it("tracks requests that are cancelled", async () => {
			const { responsePromise, cancelFn, requests } = transform({
				port: 9999,
				text: "my text",
				correlationId: "my-correlation-id",
				rot13ServiceHang: true,
			});
			const expectedData = {
				port: 9999,
				text: "my text",
				correlationId: "my-correlation-id",
			};

			cancelFn();
			await testHelper.ignorePromiseErrorAsync(responsePromise);

			assert.deepEqual(requests.data, [
				expectedData,
				{ ...expectedData, cancelled: true },
			], "should track cancellation");
		});

		it("doesn't track attempted cancellations that don't actually cancel the request", async () => {
			const { cancelFn, requests } = await transformAsync({   // wait for request to complete
				port: 9999,
				text: "my text",
				correlationId: "my-correlation-id",
				rot13ServiceHang: false,
			});

			cancelFn();

			assert.deepEqual(requests.data, [{
				port: 9999,
				text: "my text",
				correlationId: "my-correlation-id",
			}]);
		});

	});


	describe("nulled instance", () => {

		it("provides default response", async () => {
			const rot13Client = Rot13Client.createNull();
			const { response } = await transformAsync({ rot13Client });
			assert.equal(response, "Null Rot13Client response");
		});

		it("can configure multiple responses", async () => {
			const rot13Client = Rot13Client.createNull([
				{ response: "response 1" },
				{ response: "response 2" },
			]);

			const { response: response1 } = await transformAsync({ rot13Client });
			const { response: response2 } = await transformAsync({ rot13Client });

			assert.equal(response1, "response 1");
			assert.equal(response2, "response 2");
		});

		it("simulates errors", async () => {
			const rot13Client = Rot13Client.createNull([{ error: "my error" }]);
			await assertFailureAsync({
				rot13Client,
				message: "Unexpected status from ROT-13 service",
				rot13ServiceStatus: 500,
				rot13ServiceHeaders: {},
				rot13ServiceBody: "my error"
			});
		});

		it("simulates hangs", async () => {
			const rot13Client = Rot13Client.createNull([ { hang: true } ]);
			const { responsePromise } = transform({ rot13Client });
			await assert.promiseDoesNotResolveAsync(responsePromise);
		});

	});

});

function transform({
	rot13Client,
	port = IRRELEVANT_PORT,
	text = IRRELEVANT_TEXT,
	correlationId = IRRELEVANT_CORRELATION_ID,
	rot13ServiceStatus = VALID_ROT13_STATUS,
	rot13ServiceHeaders = VALID_ROT13_HEADERS,
	rot13ServiceBody = VALID_ROT13_BODY,
	rot13ServiceHang = false,
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		rot13Client: [ undefined, Rot13Client ],
		port: [ undefined, Number ],
		text: [ undefined, String ],
		correlationId: [ undefined, String ],
		rot13ServiceStatus: [ undefined, Number ],
		rot13ServiceHeaders: [ undefined, Object ],
		rot13ServiceBody: [ undefined, String ],
		rot13ServiceHang: [ undefined, Boolean ],
	}]]);

	const httpClient = HttpClient.createNull({
		"/rot13/transform": [{
			status: rot13ServiceStatus,
			headers: rot13ServiceHeaders,
			body: rot13ServiceBody,
			hang: rot13ServiceHang,
		}],
	});
	const httpRequests = httpClient.trackRequests();

	rot13Client = rot13Client ?? new Rot13Client(httpClient);
	const requests = rot13Client.trackRequests();
	const { transformPromise, cancelFn } = rot13Client.transform(port, text, correlationId);
	return { responsePromise: transformPromise, cancelFn, requests, httpRequests };
}

async function transformAsync(options) {
	const { responsePromise, ...results } = transform(options);
	return { response: await responsePromise, ...results };
}

async function assertFailureAsync({
	rot13Client,
	rot13ServiceStatus = VALID_ROT13_STATUS,
	rot13ServiceHeaders = VALID_ROT13_HEADERS,
	rot13ServiceBody = VALID_ROT13_BODY,
	message,
}) {
	ensure.signature(arguments, [{
		rot13Client: [ undefined, Rot13Client ],
		rot13ServiceStatus: [ undefined, Number ],
		rot13ServiceHeaders: [ undefined, Object ],
		rot13ServiceBody: [ undefined, String ],
		message: String,
	}]);

	const expectedError =
		`${message}\n` +
		`Host: ${HOST}:9999\n` +
		"Endpoint: /rot13/transform\n" +
		`Status: ${rot13ServiceStatus}\n` +
		`Headers: ${JSON.stringify(rot13ServiceHeaders)}\n` +
		`Body: ${rot13ServiceBody}`;

	await assert.throwsAsync(
		() => transformAsync({
			rot13Client,
			rot13ServiceStatus,
			rot13ServiceHeaders,
			rot13ServiceBody,
			port: 9999,
		}),
		expectedError
	);
}
