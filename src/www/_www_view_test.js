// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const wwwView = require("./www_view");

describe("WWW View", () => {

	describe("home page", () => {

		it("renders page", () => {
			const response = wwwView.homePage();

			assert.equal(response.status, 200, "status");
			assertHtmlContentType(response);
			assertHasPageTemplate(response, "ROT-13 Translator");
		});

		it("doesn't have anything in text field by default", () => {
			const response = wwwView.homePage();
			assert.includes(response.body, 'name="text" value=""');

		});

		it("can pre-populate text field", () => {
			const response = wwwView.homePage("pre-populated text");
			assert.includes(response.body, 'name="text" value="pre-populated text"');
		});

	});


	describe("error pages", () => {

		it("renders HTML", () => {
			const response = wwwView.errorPage(999, "my error");

			assert.equal(response.status, 999, "status");
			assertHtmlContentType(response);
			assertHasPageTemplate(response, "999: my error");
		});

		it("puts error message in body", () => {
			const response = wwwView.errorPage(999, "my error");

			assert.includes(response.body, "<p>my error</p>");
		});

	});

});

function assertHtmlContentType(response) {
	assert.deepEqual(response.headers["content-type"], "text/html; charset=utf-8", "content-type");
}

function assertHasPageTemplate(response, expectedTitle) {
	assert.includes(response.body, `<title>${expectedTitle}</title>`, "title");
}
