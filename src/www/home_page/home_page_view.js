// Copyright Titanium I.T. LLC.
import { HttpServerResponse } from "http/http_server_response.js";
import * as wwwView from "../www_view.js";

/** Home page response */

/**
 * Render home page.
 * @param [text] text to enter into data entry field (blank if not provided)
 * @returns {HttpServerResponse} home page for server to return
 */
export function homePage(text = "") {
	const body = `
		<p>Enter text to translate:</p>
		<form method="post">
			<input type="text" name="text" value="${text}" required />
			<input type="submit" value="Translate" />
		</form>
	`;

	return HttpServerResponse.createHtmlResponse({
		status: 200,
		body: wwwView.pageTemplate("ROT-13 Translator", body),
	});
}