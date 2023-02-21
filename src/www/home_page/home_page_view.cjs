// Copyright Titanium I.T. LLC.
const HttpResponse = require("http/http_response");
const wwwView = require("../www_view.cjs");

/** Home page response */
exports.homePage = function(text = "") {
	const body = `
		<p>Enter text to translate:</p>
		<form method="post">
			<input type="text" name="text" value="${text}" required />
			<input type="submit" value="Translate" />
		</form>
	`;

	return HttpResponse.createHtmlResponse({
		status: 200,
		body: wwwView.pageTemplate("ROT-13 Translator", body),
	});
};
