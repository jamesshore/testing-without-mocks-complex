// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const testHelper = require("util/test_helper");
const ensure = require("util/ensure");
const path = require("path");
const childProcess = require("child_process");
// dependency_analysis: ./serve.js

const TIMEOUT_IN_MS = 2000;

describe("Smoke test", () => {

	it("starts servers", async function() {
		this.timeout(TIMEOUT_IN_MS + 1000);

		await new Promise((resolve, reject) => {
			let startupCount = 0;
			let stdout = "";
			const process = forkModule(
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
				if (chunk.includes('"emergency"')) {
					return fail("Startup logged emergency");
				}
				if (chunk.includes('"server started"')) {
					startupCount++;
				}
				if (startupCount === 2) {
					// both servers have started; test was a success
					clearTimeout(timeoutHandle);
					return kill(() => resolve());
				}
			});

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


function forkModule(cwd, modulePath, {
	args = []
} = {}) {
	ensure.signature(arguments, [ String, String, [ undefined, {
		args: [ undefined, Array ],
	}]], [ "cwd", "modulePath", "options" ]);

	const absolutePath = path.resolve(cwd, modulePath);
	const options = {
		stdio: "pipe",
	};
	return childProcess.fork(absolutePath, args, options);

	// let stdout = "";
	// let stderr = "";
	// child.stdout.on("data", (data) => {
	// 	stdout += data;
	// });
	// child.stderr.on("data", (data) => {
	// 	stderr += data;
	// });
	//
	// child.on("exit", () => {
	// 	if (failOnStderr && stderr !== "") {
	// 		console.log(stderr);
	// 		return reject(new Error("Runner failed"));
	// 	}
	// 	else {
	// 		return resolve({ stdout, stderr });
	// 	}
	// });
}
