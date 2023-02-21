// Copyright Titanium I.T. LLC.
import HttpResponse from "http/http_response.cjs";
import wwwView from "../www_view.cjs";

/** Home page response */
export function homePage(text = "") {
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
}