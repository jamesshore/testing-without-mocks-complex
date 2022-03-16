// Copyright Titanium I.T. LLC.
"use strict";

const Mocha = require("mocha");

exports.runTestsAsync = function(options, success, failure) {
	return new Promise((resolve, reject) => {
		// Mocha leaks 'uncaughtException' listeners. So prior to running Mocha, we save the current set of listeners.
		// Then after running Mocha, we check again and turn off any new ones.
		const preMochaListeners = process.listeners("uncaughtException");

		const mocha = new Mocha(options.options);
		options.files.forEach(mocha.addFile.bind(mocha));
		mocha.run(function(failures) {
			cleanUpListenerLeak(preMochaListeners);

			if (failures) return reject(new Error("Tests failed"));
			else return resolve();
		});
	});
};

function cleanUpListenerLeak(preMochaListeners) {
	const postMochaListeners = process.listeners("uncaughtException");
	const leakedListeners = postMochaListeners.filter((listener) => !preMochaListeners.includes(listener));
	leakedListeners.forEach(listener => process.off("uncaughtException", listener));
}