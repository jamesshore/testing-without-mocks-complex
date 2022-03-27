// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const testHelper = require("util/test_helper");
const ensure = require("util/ensure");
const path = require("path");
const childProcess = require("child_process");
// dependency_analysis: ./serve.js

const TIMEOUT_IN_MS = 2000;
const STARTUP_FAILED_REGEX = /"emergency"/;
const SERVER_STARTED_REGEX = /"server started".*?\n.*?"server started"/;  // look for both servers to start

describe("Smoke test", () => {

	it("starts servers", async function() {
		this.timeout(TIMEOUT_IN_MS + 1000);

		await new Promise((resolve, reject) => {
			let startupCount = 0;
			let stdout = "";
			const process = testHelper.forkModule(
				__dirname,
				"./serve.js",
				{ args: ["5001", "5002"] },
			);

			const timeoutHandle = setTimeout(() => {
				return fail("Startup timed out");
			}, TIMEOUT_IN_MS);

			process.stdout.on("data", (chunkBuffer) => {
				const chunk = chunkBuffer.toString();
				stdout += chunk;
				if (STARTUP_FAILED_REGEX.test(stdout)) {
					return fail("Startup logged emergency");
				}
				if (SERVER_STARTED_REGEX.test(stdout)) {
					clearTimeout(timeoutHandle);
					return succeed();
				}
			});

			function succeed() {
				return kill(() => {
					return resolve();
				});
			}

			function fail(reason) {
				kill(() => {
					return reject(new Error(`${reason}. Logs:\n${stdout}`));
				});
			}

			function kill(thenFn) {
				process.kill();
				process.on("exit", () => thenFn());
			}
		});
	});

});
