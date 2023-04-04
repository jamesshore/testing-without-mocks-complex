#!/usr/local/bin/node

// Automatically runs build when files change.
//
// Thanks to Davide Alberto Molin for inspiring this code.
// See https://www.letscodejavascript.com/v3/comments/live/7 for details.

import gaze from "gaze";
import pathLib from "path";
import * as paths from "../config/paths.js";
import sound from "sound-play";
import * as sh from "../util/sh.js";
import Colors from "../util/colors.js";
import { pathToFile } from "../util/module_paths.js";
import child_process from "node:child_process";

const TIMEOUT_IN_MS = 5000;
const PLAY_SOUNDS = true;

const SUCCESS = 0;
const LINT_ERROR = 1;
const FAILURE = 2;
const TIMEOUT = 3;

const watchColor = Colors.cyan;
const errorColor = Colors.brightRed.inverse;
const buildScript = pathToFile(import.meta.url, "../scripts/run_build.js");

const args = process.argv.slice(2);
let buildRunning = false;
let buildQueued = false;
let buildStartedAt;

process.stdout.write("Starting file watcher: ");
gaze(paths.watchRestartFiles(), (err, watcher) => {
	if (err) {
		console.log(errorColor("WATCH ERROR:"), err);
		return;
	}
	watcher.on("all", () => {
		console.log(watchColor("*** Build files changed"));
		restart();
	});
});

gaze(paths.watchFiles(), function(err, watcher) {
	if (err) {
		console.log(errorColor("WATCH ERROR:"), err);
		return;
	}
	console.log(".\n");

	watcher.on("changed", triggerBuild.bind(null, "changed"));
	watcher.on("deleted", cleanAndRestart.bind(null, "deleted"));
	watcher.on("added", restart.bind(null, "added"));
	triggerBuild();    // Always run after startup
});


async function triggerBuild(event, filepath) {
	try {
		logEvent(event, filepath);
		if (!buildRunning) await runBuild();
		else queueAnotherBuild();
	}
	catch (err) {
		console.log(err);
	}
}

async function runBuild() {
	do {
		buildQueued = false;
		buildRunning = true;
		buildStartedAt = Date.now();
		console.log(watchColor(`\n\n\n\n*** BUILD> ${args.join(" ")}`));

		const code = await shellToBuildAsync(args);
		alertBuildResult(code);

		buildRunning = false;
	} while (buildQueued);
}

async function shellToBuildAsync(args) {
	const command = "node";
	const commandArgs = [ "--enable-source-maps", buildScript, ...args ];

	const child = child_process.spawn(command, commandArgs, { stdio: "inherit" });
	const spawnPromise = new Promise((resolve, reject) => {
		child.on("error", reject);
		child.on("exit", (code) => { resolve(code); });
	});
	const timeoutPromise = new Promise((resolve, reject) => {
		setTimeout(resolve.bind(null, TIMEOUT), TIMEOUT_IN_MS);
	});

	const code = await Promise.race([ spawnPromise, timeoutPromise ]);
	if (code === TIMEOUT) {
		console.log("\n" + errorColor("  BUILD TIMED OUT  "));
		child.kill();
		await new Promise((resolve, reject) => {
			child.on("exit", resolve);
		});
	}

	return code;
}

function queueAnotherBuild() {
	if (buildQueued) return;
	if (debounce()) return;

	console.log(watchColor("*** Build queued"));
	buildQueued = true;

	function debounce() {
		const msSinceLastBuild = Date.now() - buildStartedAt;
		return msSinceLastBuild < 100;
	}
}

function alertBuildResult(exitCode) {
	if (PLAY_SOUNDS) playSoundAsync(pathForCode(exitCode));

	function pathForCode(exitCode) {
		switch (exitCode) {
			case SUCCESS: return "../sounds/success.wav";
			case LINT_ERROR: return "../sounds/lint_error.wav";
			case FAILURE:
			case TIMEOUT:
				return "../sounds/fail.wav";
			default: throw new Error(`Unrecognized exit code from build: ${exitCode}`);
		}
	}
}

async function cleanAndRestart(event, filepath) {
	await shellToBuildAsync([ "clean" ]);
	restart();
}

function restart(event, filepath) {
	if (event !== undefined) logEvent(event, filepath);
	process.exit(0);
	// watch.sh will detect that process exited cleanly and restart it
}

function logEvent(event, filepath) {
	if (filepath === undefined) return;

	const truncatedPath = pathLib.basename(pathLib.dirname(filepath)) + "/" + pathLib.basename(filepath);
	console.log(watchColor(`*** ${event.toUpperCase()}: ${truncatedPath}`));
}

async function playSoundAsync(filename) {
	try {
		const path = pathToFile(import.meta.url, filename);
		await sound.play(path, 0.3);
	}
	catch (err) {
		// If something goes wrong, just ignore it
	}
}
