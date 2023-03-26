// Copyright Titanium I.T. LLC.

import { checkNodeVersion } from "../util/node_version_checker.js";
import * as repo from "../util/repo.js";
import branches from "../config/branches.js";
import Colors from "../util/colors.js";

checkNodeVersion();

runAsync();

async function runAsync() {
	try {
		await selfCheckAsync();
		console.log(Colors.brightGreen.inverse("\n   SELF-CHECK OK   \n"));
	}
	catch (err) {
		checkNodeVersion();

		process.stdout.write(
			Colors.brightRed.inverse("\n   SELf-CHECK FAILED   \n") +
			Colors.brightRed(`${err.message}\n\n`)
		);
	}
}

async function selfCheckAsync() {
	const branchNames = Object.values(branches);
	for (let i = 0; i < branchNames.length; i++) {
		const branch = branchNames[i];

		console.log("\n\n\n" + Colors.brightWhite.underline(`Testing branch: ${branch}`));
		await validateBranchAsync(branch);
		console.log(Colors.green(`Branch ok: ${branch}\nBranches remaining: ${branchNames.length - i - 1}`));
	}
}

async function validateBranchAsync(branch) {
	try {
		await repo.runCodeInBranch(branch, async() => {
			await repo.runBuildAsync();
		});
	}
	catch (err) {
		throw new Error(`Branch failed build: ${branch}`);
	}
}

