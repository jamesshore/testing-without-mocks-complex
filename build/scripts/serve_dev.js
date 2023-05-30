#!/usr/local/bin/node

// Automatically restarts server when files change.
//
// Thanks to Davide Alberto Molin for inspiring this code.
// See https://www.letscodejavascript.com/v3/comments/live/7 for details.

import { checkNodeVersion } from "../util/node_version_checker.js";
import gaze from "gaze";
import pathLib from "node:path";
import { spawn } from "node:child_process";
import * as paths from "../config/paths.js";
import Colors from "../util/colors.js";
import * as repo from "../util/repo.js";

checkNodeVersion();

const watchColor = Colors.cyan;
const errorColor = Colors.brightRed.inverse;

const COMMAND = "node";
const COMMAND_ARGS = process.argv.slice(2);

let child = null;

process.stdout.write("Starting file watcher: ");
gaze(paths.watchFiles(), function(err, watcher) {
	if (err) {
		console.log(errorColor("WATCH ERROR:"), err);
		return;
	}
	console.log(".\nWill restart server when files change.\n");

	let debounce = false;
	watcher.on("all", (event, filepath) => {
		logEvent(event, filepath);
		if (debounce) return;

		debounce = true;
		setTimeout(() => {
			debounce = false;
			kill(run);
		}, 200);
	});
	run();
});

function run() {
	if (child) return;

	repo.compileAsync().then(() => {
		console.log(watchColor(`> ${COMMAND} ${(paths.main)} ${COMMAND_ARGS.join(" ")}`));
		child = spawn(COMMAND, [ paths.main, ...COMMAND_ARGS ], { stdio: "inherit" });
		child.on("exit", function() {
			console.log(watchColor(`${COMMAND} exited\n`));
			child = null;
		});
	})
	.catch((err) => {
		console.log(errorColor("COMPILE ERROR:", err));
	});
}

function kill(callback) {
	if (child === null) return callback();

	console.log(watchColor(`> kill ${COMMAND}`));
	child.kill();
	child.on("exit", callback);
}

function logEvent(event, filepath) {
	if (filepath === undefined) return;

	const truncatedPath = pathLib.basename(pathLib.dirname(filepath)) + "/" + pathLib.basename(filepath);
	console.log(watchColor(`${event.toUpperCase()}: ${truncatedPath}`));
}

