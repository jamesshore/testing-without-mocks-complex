// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");
const wwwView = require("./www_view");

/** GET endpoint for / */
exports.getAsync = function(request) {
	return wwwView.homePage();
};