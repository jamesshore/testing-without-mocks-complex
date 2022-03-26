// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");
const wwwView = require("./www_view");

/** GET endpoint for / */
exports.getAsync = function(request) {
	return wwwView.homePage();
};

/** POST endpoint for / */
exports.postAsync = async function(request) {
	const text = parseBody(await request.readBodyAsync());
	return wwwView.homePage(text);
};

function parseBody(body) {
	const [ name, value ] = body.split("=");
	return value;
}