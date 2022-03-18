// Copyright Titanium I.T. LLC.
"use strict";

const HttpResponse = require("http/http_response");

/** render home page response */
exports.homePage = function() {
	const body = `
		<p>Enter text to translate:</p>
		<form action="" method="post">
			<input type="text" name="text" required />
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
	return HttpResponse.createPlainTextResponse({
		status: 501,
		body: `errorPage view not yet implemented (status: ${status})`,
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