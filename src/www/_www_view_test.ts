// Copyright Titanium I.T. LLC.
import assert from "util/assert.js";
import * as wwwView from "./www_view.js";

describe("WWW View", () => {

	describe("page template", () => {

		it("renders HTML", () => {
			const template = wwwView.pageTemplate("my title", "my body");
			assert.includes(template, "<title>my title</title>", "title");
			assert.includes(template, "<body>my body</body>", "body");
		});

	});


	describe("error pages", () => {

		it("sets status", () => {
			const response = wwwView.errorPage(999, "my error");
			assert.equal(response.status, 999, "status");
		});

		it("puts error in title", () => {
			const response = wwwView.errorPage(999, "my error");
			assert.includes(response.body, "<title>999: my error</title>", "title");
		});

		it("puts error in body", () => {
			const response = wwwView.errorPage(999, "my error");
			assert.includes(response.body, "<p>my error</p>");
		});

	});

});

