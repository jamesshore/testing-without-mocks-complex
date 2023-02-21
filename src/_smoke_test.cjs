// Copyright Titanium I.T. LLC.
const assert = require("util/assert");
const testHelper = require("util/test_helper");
// dependency_analysis: ./serve.js

const STARTUP_TIMEOUT_IN_MS = 2000;
const STARTUP_FAILED_REGEX = /"emergency"/;
const SERVER_STARTED_REGEX = /"server started".*?\n.*?"server started"/;  // look for both servers to start

const WWW_PORT = 5001;
const ROT13_PORT = 5002;

describe("Smoke test", function() {
	this.timeout(STARTUP_TIMEOUT_IN_MS + 1000);

	it("performs end-to-end ROT-13 transform", async () => {
		await runServersAsync(async () => {
			const { status, body } = await testHelper.requestAsync({
				port: WWW_PORT,
				url: "/",
				method: "POST",
				body: [ "text=hello" ],
			});

			assert.equal(status, 200, "status");
			assert.includes(body, 'value="uryyb"', "body");
		});
	});

});

async function runServersAsync(fnAsync) {
	const killFnAsync = await forkAsync();
	try {
		await fnAsync();
	}
	finally {
		await killFnAsync();
	}
}

async function forkAsync() {
	return await new Promise((resolve, reject) => {
		let stdout = "";
		const process = testHelper.forkModule(
			__dirname,
			"./serve.js",
			{ args: [ WWW_PORT.toString(), ROT13_PORT.toString() ] },
		);

		const timeoutHandle = setTimeout(() => {
			return fail(new Error("Startup timed out"));
		}, STARTUP_TIMEOUT_IN_MS);

		process.stdout.on("data", (chunk) => {
			stdout += chunk;
			if (STARTUP_FAILED_REGEX.test(stdout)) {
				return fail(new Error("Startup logged emergency"));
			}
			if (SERVER_STARTED_REGEX.test(stdout)) {
				return succeed();
			}
		});

		function succeed() {
			clearTimeout(timeoutHandle);
			const killFnAsync = () => new Promise((innerResolve) => kill(innerResolve));
			return resolve(killFnAsync);
		}

		function fail(err) {
			kill(() => {
				err.message += `\nLogs:\n${stdout}`;
				return reject(err);
			});
		}

		function kill(thenFn) {
			process.kill();
			process.on("exit", () => thenFn());
		}
	});
}
