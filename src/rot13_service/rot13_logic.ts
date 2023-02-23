// Copyright Titanium I.T. LLC.

/** ROT-13 transformation logic */

/**
 * Transform a string using ROT-13 encoding.
 * @param input the string to transform
 * @returns {string} the transformed string
 */
export function transform(input: string): string {
	return input.replace(/[A-Za-z]/g, transformLetter);
}

function transformLetter(letter: string): string {
	const rotation = letter.toUpperCase() <= "M" ? 13 : -13;
	return String.fromCharCode(letter.charCodeAt(0) + rotation);
}

