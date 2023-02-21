// Copyright Titanium I.T. LLC.
import HttpResponse from "http/http_response.cjs";

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

	return HttpResponse.createHtmlResponse({
		status,
		body: pageTemplate(title, body),
	});
}