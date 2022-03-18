// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const HttpRequest = require("http/http_request");
const wwwController = require("./home_page_controller");
const wwwView = require("./www_view");

describe("WWW View", () => {

	describe("home page", () => {

		it("renders HTML", () => {
			const { status, headers } = wwwView.homePage();
			assert.equal(status, 200, "status");
			assert.deepEqual(headers, { "content-type": "text/html; charset=utf-8" }, "headers");
		});

		it("has page template", () => {
			assertHasPageTemplate(wwwView.homePage(), "ROT-13 Translator");
		});

	});

});

function assertHasPageTemplate(response, expectedTitle) {
	assert.includes(response.body, `<title>${expectedTitle}</title>`);
}