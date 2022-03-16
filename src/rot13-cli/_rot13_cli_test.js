// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const CommandLine = require("infrastructure/command_line");
const Rot13Client = require("./infrastructure/rot13_client");
const Clock = require("infrastructure/clock");
const cli = require("./rot13_cli");

const VALID_PORT = 5000;
const VALID_TEXT = "my_text";
const VALID_ARGS = [ VALID_PORT.toString(), VALID_TEXT ];

const TIMEOUT_IN_MS = 5000;

describe("ROT-13 CLI", function() {

	it("calls ROT-13 service", async function() {
		const { rot13Requests, clock, stdout } = await runAsync({
			args: VALID_ARGS,
			rot13Response: "transformed text",
		});

		assert.deepEqual(rot13Requests, [{
			port: VALID_PORT,
			text: VALID_TEXT,
		}]);
		assert.deepEqual(stdout, [ "transformed text\n" ]);

		await clock.advanceNullTimersAsync();
		assert.equal(clock.now(), 0);
	});

	it("outputs an error when ROT-13 service fails", async function() {
		const { stderr } = await runAsync({
			args: VALID_ARGS,
			rot13Error: "my error",
		});

		assert.equal(stderr[0], "ROT-13 service failed:\n");
		assert.match(stderr[1], /my error/);
	});

	it("times out ROT-13 service when service responds too slowly", async function() {
		const { runPromise, rot13Requests, clock, stderr } = run({
			args: VALID_ARGS,
			rot13Hang: true,
		});

		await clock.advanceNullAsync(TIMEOUT_IN_MS);
		await assert.promiseResolvesAsync(runPromise);
		assert.deepEqual(rot13Requests, [
			{
				port: VALID_PORT,
				text: VALID_TEXT,
			},
			{
				port: VALID_PORT,
				text: VALID_TEXT,
				cancelled: true,
			},
		]);
		assert.deepEqual(stderr, [
			"ROT-13 service failed:\n",
			"Service timed out.\n",
		]);
	});

	it("writes usage to command-line when arguments not provided", async function() {
		const { stderr } = await runAsync({ args: [] });
		assert.deepEqual(stderr, [ "Usage: run PORT TEXT\n" ]);
	});

});

async function runAsync(options) {
	const results = run(options);
	await results.runPromise;
	return results;
}

function run({ args, rot13Response, rot13Error, rot13Hang }) {
	const commandLine = CommandLine.createNull({ args });
	const stdout = commandLine.trackStdout();
	const stderr = commandLine.trackStderr();

	const rot13Client = Rot13Client.createNull([{ response: rot13Response, error: rot13Error, hang: rot13Hang }]);
	const rot13Requests = rot13Client.trackRequests();

	const clock = Clock.createNull();

	const runPromise = cli.runAsync({ commandLine, rot13Client, clock });

	return { runPromise, stdout, stderr, rot13Requests, clock };
}