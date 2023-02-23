// Copyright Titanium I.T. LLC.
import { HttpServerResponse } from "http/http_server_response.js";

/** Overall HTML template for website */
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

/** Error page response */
export function errorPage(status, message) {
	const title = `${status}: ${message}`;
	const body = `<p>${message}</p>`;

	return HttpServerResponse.createHtmlResponse({
		status,
		body: pageTemplate(title, body),
	});
}