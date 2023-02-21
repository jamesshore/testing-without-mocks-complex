// Copyright Titanium I.T. LLC.
const ensure = require("util/ensure.cjs");

/** ROT-13 transformation logic */
exports.transform = function(input) {
	ensure.signature(arguments, [ String ]);

	return input.replace(/[A-Za-z]/g, transformLetter);
};

function transformLetter(letter) {
	const rotation = letter.toUpperCase() <= "M" ? 13 : -13;
	return String.fromCharCode(letter.charCodeAt(0) + rotation);
}

