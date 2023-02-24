// Copyright Titanium I.T. LLC.
import { HttpServerResponse } from "http/http_server_response.js";

/**
 * Overall HTML template for the user-facing website.
 * @param title page title
 * @param body page body (HTML)
 * @returns {string} HTML for page; still needs to be wrapped in server response
 */
export function pageTemplate(title, body) {
	return `
		<html lang="en">
		<head>
			<title>${title}</title>
		</head>
		<body>${body}</body>
		</html>
	`;
}

/**
 * Error page.
 * @param status error status code
 * @param message error description
 * @returns {HttpServerResponse} error page for server to return
 */
export function errorPage(status, message) {
	const title = `${status}: ${message}`;
	const body = `<p>${message}</p>`;

	return HttpServerResponse.createHtmlResponse({
		status,
		body: pageTemplate(title, body),
	});
}