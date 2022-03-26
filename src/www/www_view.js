// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");

/** render home page response */
exports.homePage = function(text = "") {
	const body = `
		<p>Enter text to translate:</p>
		<form method="post">
			<input type="text" name="text" value="${text}" required />
			<input type="text" name="text2" value="${text}" required />
			<input type="text" name="text3" value="${text}" required />
			<input type="submit" value="Translate" />
		</form>
	`;

	return HttpResponse.createHtmlResponse({
		status: 200,
		body: pageTemplate("ROT-13 Translator", body),
	});
};

/** error responses for user-facing www site */
exports.errorPage = function(status, message) {
	const title = `${status}: ${message}`;
	const body = `<p>${message}</p>`;

	return HttpResponse.createHtmlResponse({
		status,
		body: pageTemplate(title, body),
	});
};

function pageTemplate(title, body) {
	return `
<html lang="en">
<head>
	<title>${title}</title>
</head>
<body>${body}</body>
</html>	
	`;
}