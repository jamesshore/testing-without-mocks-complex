// Copyright (c) 2013-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

exports.check = function(arg, expectedTypes, options) {
	const argType = getType(arg);
	if (!Array.isArray(expectedTypes)) expectedTypes = [ expectedTypes ];
	options = options || {};
	options.name = options.name || "argument";

	for (let i = 0; i < expectedTypes.length; i++) {
		if (oneTypeMatches(arg, argType, expectedTypes[i])) {
			if (isStructComparison(argType, expectedTypes[i])) return checkStruct(arg, expectedTypes[i], options);
			else return null;
		}
	}
	return describeError(arg, argType, expectedTypes, options.name, options.allowExtraKeys);


	function oneTypeMatches(arg, argType, expectedType) {
		if (argType === Object) return checkObject(arg, expectedType);
		else if (Number.isNaN(argType)) return Number.isNaN(expectedType);
		else return argType === expectedType;

		function checkObject(arg, type) {
			if (type === null) return false;
			else if (typeof type === "function") return arg instanceof type;
			else if (typeof type === "object") return typeof arg === "object";
			else return false;
		}
	}

	function isStructComparison(argType, type) {
		return argType === Object && typeof type === "object";
	}

	function checkStruct(arg, type, options) {
		if (typeof type !== "object") throw new Error("unrecognized type: " + type);

		const unmatched = Object.assign({}, arg);
		const keys = Object.getOwnPropertyNames(type);
		for (let i = 0; i < keys.length; i++) {
			const newOptions = Object.assign({}, options);
			newOptions.name = options.name + "." + keys[i];
			const checkResult = exports.check(arg[keys[i]], type[keys[i]], newOptions);
			if (checkResult !== null) return checkResult;
			delete unmatched[keys[i]];
		}
		if (!options.allowExtraKeys) {
			const unmatchedKeys = Object.keys(unmatched);
			const s = unmatchedKeys.length > 1 ? "s" : "";
			if (unmatchedKeys.length > 0) return `${options.name} had unexpected parameter${s}: ${unmatchedKeys.join(", ")}`;
		}

		return null;
	}

	function describeError(arg, argType, type, name, allowExtraKeys) {
		const describe = exports.describe;
		const options = { articles: true, atLeast: allowExtraKeys };
		if (argType === Object && !isStruct(arg)) argType = arg;
		return name + " must be " + describe(type, options) + ", but it was " + describe(argType, options);
	}

};


exports.describe = function(type, options) {
	if (!Array.isArray(type)) type = [ type ];
	if (options === undefined) options = {};

	const descriptions = type.map(function(oneType) {
		return describeOneType(oneType);
	});
	if (descriptions.length <= 2) {
		return descriptions.join(" or ");
	}
	else {
		const allButLast = descriptions.slice(0, -1);
		const last = descriptions[descriptions.length - 1];
		return allButLast.join(", ") + ", or " + last;    // dat Oxford comma
	}

	function describeOneType(type) {
		switch(type) {
			case Boolean: return options.articles ? "a boolean" : "boolean";
			case String: return options.articles ? "a string" : "string";
			case Number: return options.articles ? "a number" : "number";
			case Function: return options.articles ? "a function" : "function";
			case Array: return options.articles ? "an array" : "array";
			case undefined: return "undefined";
			case null: return "null";

			default:
				if (Number.isNaN(type)) return "NaN";
				else if (typeof type === "function") return describeConstructor(type, options);
				else if (typeof type === "object") {
					if (isStruct(type)) return describeStruct(type, options);
					else return describeInstance(type, options);
				}
				else throw new Error("unrecognized type: " + type);
		}
	}

	function describeConstructor(type, options) {
		const articles = options.articles;

		if (type === Object) return articles ? "an object" : "object";
		else if (type === RegExp) return articles ? "a regular expression" : "regular expression";

		let name = type.name;
		if (name) {
			if (articles) name = "a " + name;
		}
		else {
			name = articles ? "an <anon>" : "<anon>";
		}
		return name + " instance";
	}

	function describeStruct(type, options) {
		const properties = Object.getOwnPropertyNames(type).map(function(key) {
			return key + ": <" + exports.describe(type[key]) + ">";
		});

		const objectDesc = options.articles ? "an object" : "object";
		if (properties.length === 0) {
			return objectDesc;
		}

		const atLeast = options.atLeast ? "at least " : "";
		return objectDesc + ` containing ${atLeast}{ ${properties.join(", ")} }`;
	}

	function describeInstance(type, options) {
		const prototypeConstructor = Object.getPrototypeOf(type).constructor;
		const article = options.articles;
		let name = (article ? "a " : "") + prototypeConstructor.name;
		if (!prototypeConstructor.name) name = (article ? "an " : "") + "<anon>";

		return name + " instance";
	}

};

function getType(variable) {
	if (variable === null) return null;
	if (Array.isArray(variable)) return Array;
	if (Number.isNaN(variable)) return NaN;

	switch (typeof variable) {
		case "boolean": return Boolean;
		case "string": return String;
		case "number": return Number;
		case "function": return Function;
		case "object": return Object;
		case "undefined": return undefined;

		default:
			throw new Error("Unreachable code executed. Unknown typeof value: " + typeof variable);
	}
}

function isStruct(type) {
	const prototype = Object.getPrototypeOf(type);
	return (!prototype || prototype.constructor === Object);
}
