// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.mjs";

/** ROT-13 transformation logic */
export function transform(input) {
	ensure.signature(arguments, [ String ]);

	return input.replace(/[A-Za-z]/g, transformLetter);
}

function transformLetter(letter) {
	const rotation = letter.toUpperCase() <= "M" ? 13 : -13;
	return String.fromCharCode(letter.charCodeAt(0) + rotation);
}

