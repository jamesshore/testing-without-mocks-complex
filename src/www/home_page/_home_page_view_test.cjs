// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("util/assert");
const homePageView = require("./home_page_view.cjs");

describe("Home Page View", () => {

	it("renders page", () => {
		const response = homePageView.homePage();

		assert.equal(response.status, 200, "status");
		assert.includes(response.body, "<title>ROT-13 Translator</title>");
	});

	it("doesn't have anything in text field by default", () => {
		const response = homePageView.homePage();
		assert.includes(response.body, 'name="text" value=""');

	});

	it("pre-populates text field", () => {
		const response = homePageView.homePage("pre-populated text");
		assert.includes(response.body, 'name="text" value="pre-populated text"');
	});

});

