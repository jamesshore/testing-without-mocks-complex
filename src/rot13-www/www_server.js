// Copyright Titanium I.T. LLC.
"use strict";

const CommandLine = require("infrastructure/command_line");
const ensure = require("util/ensure");
const Rot13Client = require("./infrastructure/rot13_client");
const Clock = require("infrastructure/clock");
const HttpServer = require("http/http_server");
const Log = require("infrastructure/log");

const TIMEOUT_IN_MS = 5000;

/** Top-level entry point for web server */

exports.serveAsync = async function({
	commandLine = CommandLine.create(),
	httpServer = HttpServer.create(Log.create()),
} = {}) {
	ensure.signature(arguments, [[ undefined, {
		commandLine: [ undefined, CommandLine ],
		httpServer: [ undefined, HttpServer ],
	}]]);

	const args = commandLine.args();

	const port = parseInt(args[0], 10);

	function onRequestAsync() {
		return {
			status: 200,
			headers: {
				"content-type": "text/plain; charset=utf-8"
			},
			body: "placeholder"
		};
	}

	await httpServer.startAsync({ port, onRequestAsync });
};

// exports.runAsync = async function({
// 	commandLine = CommandLine.create(),
// 	rot13Client = Rot13Client.create(),
// 	clock = Clock.create(),
// } = {}) {
// 	ensure.signature(arguments, [[ undefined, {
// 		commandLine: [ undefined, CommandLine ],
// 		rot13Client: [ undefined, Rot13Client ],
// 		clock: [ undefined, Clock ],
// 	}]]);
//
// 	const args = commandLine.args();
// 	if (args.length !== 2) {
// 		commandLine.writeStderr("Usage: run PORT TEXT\n");
// 		return;
// 	}
//
// 	const port = parseInt(args[0], 10);
// 	const text = args[1];
//
// 	try {
// 		const { transformPromise, cancelFn } = rot13Client.transform(port, text);
// 		const response = await clock.timeoutAsync(TIMEOUT_IN_MS, transformPromise, () => timeout(cancelFn));
// 		commandLine.writeStdout(response + "\n");
// 	}
// 	catch (err) {
// 		commandLine.writeStderr("ROT-13 service failed:\n");
// 		commandLine.writeStderr(err.message + "\n");
// 	}
// };
//
// function timeout(cancelFn) {
// 	cancelFn();
// 	throw new Error("Service timed out.");
// }{}