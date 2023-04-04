// Copyright Titanium I.T. LLC.

import * as repo from "../util/repo.js";
import branches from "../config/branches.js";
import pathLib from "node:path";
import Colors from "../util/colors.js";

runAsync();

async function runAsync() {
	const args = process.argv;
	if (args.length !== 3) {
		const name = pathLib.basename(process.argv[1]).split(".")[0];
		console.log(`Usage: ${name} "commit message"`);
		return;
	}

	try {
		await integrateAsync(args[2]);
		console.log(Colors.brightGreen.inverse("\n   SUCCESS   \n"));
	}
	catch (err) {
		process.stdout.write(
			Colors.brightRed.inverse("\n   FAILED   \n") +
			Colors.brightRed(`${err.message}\n\n`)
		);
	}
}

async function integrateAsync(message) {
	writeHeader("Checking repository");
	await ensureNothingToCheckIn("Commit changes before integrating");

	writeHeader("Checking npm");
	await ensureNpmBuildFilesAreIgnored();

	writeHeader("Validating build");
	await validateBuildAsync(branches.dev);

	writeHeader("Merging dev branch");
	await mergeBranchesAsync(message);

	writeHeader("Validating integration");
	await validateBuildAsync(branches.integration);

	writeHeader("Rebasing branches");
	await rebaseAsync();
}

async function rebaseAsync() {
	await rebaseOneBranchAsync(branches.typescript, branches.integration);

	// Exercise branches below.

	await rebaseOneBranchAsync(branches.usingNullablesJs, branches.integration);
	await rebaseOneBranchAsync(branches.usingNullablesJsValidation, branches.usingNullablesJs);
	await rebaseOneBranchAsync(branches.usingNullablesTs, branches.typescript);
	await rebaseOneBranchAsync(branches.usingNullablesTsValidation, branches.usingNullablesTs);

	await rebaseOneBranchAsync(branches.highLevelInfrastructureJs, branches.integration);
	await rebaseOneBranchAsync(branches.highLevelInfrastructureJsValidation, branches.highLevelInfrastructureJs);
	await rebaseOneBranchAsync(branches.highLevelInfrastructureTs, branches.typescript);
	await rebaseOneBranchAsync(branches.highLevelInfrastructureTsValidation, branches.highLevelInfrastructureTs);

	await rebaseOneBranchAsync(branches.narrowIntegrationTestsJs, branches.integration);
	await rebaseOneBranchAsync(branches.narrowIntegrationTestsJsValidation, branches.narrowIntegrationTestsJs);
	await rebaseOneBranchAsync(branches.narrowIntegrationTestsTs, branches.typescript);
	await rebaseOneBranchAsync(branches.narrowIntegrationTestsTsValidation, branches.narrowIntegrationTestsTs);

	await rebaseOneBranchAsync(branches.embeddedStubsJs, branches.narrowIntegrationTestsJsValidation);
	await rebaseOneBranchAsync(branches.embeddedStubsJsValidation, branches.embeddedStubsJs);
	await rebaseOneBranchAsync(branches.embeddedStubsTs, branches.narrowIntegrationTestsTsValidation);
	await rebaseOneBranchAsync(branches.embeddedStubsTsValidation, branches.embeddedStubsTs);
}

async function rebaseOneBranchAsync(branchFrom, branchTo) {
	// Branches are rebased interactively because of the number of branches that build on each other. Later
	// branches tend to run into conflicts found in earlier branches. They can typically be fixed by just removing
	// the offending commit, because it's already part of the history of the branch that the rebase is building
	// on top of.

	writeHeader(`Rebasing ${branchFrom} branch`);
	await repo.rebaseInteractiveAsync(branchFrom, branchTo);

	writeHeader(`Validating ${branchFrom} branch`);
	await validateBuildAsync(branchFrom);
}

async function ensureNpmBuildFilesAreIgnored() {
	await repo.runCodeInBranch(branches.dev, async () => {
		await repo.rebuildNpmPackagesAsync(branches.dev);
		await ensureNothingToCheckIn("Need to ignore NPM build files");
	});
}

async function ensureNothingToCheckIn(errorMessage) {
	if (await repo.hasUncommittedChangesAsync()) throw new Error(errorMessage);
}

async function mergeBranchesAsync(message) {
	try {
		await repo.mergeBranchWithCommitAsync(branches.dev, branches.integration, `INTEGRATE: ${message}`);
		await repo.mergeBranchWithoutCommitAsync(branches.integration, branches.dev);
	}
	catch (err) {
		writeHeader("Integration failed; resetting repository");
		await repo.resetToFreshCheckoutAsync();
		throw new Error("Integration failed");
	}
}

async function validateBuildAsync(branch) {
try {
		await repo.runCodeInBranch(branch, async() => {
			await repo.runBuildAsync();
		});
	}
	catch (err) {
		throw new Error(`${branch} failed build`);
	}
}

function writeHeader(message) {
	console.log(Colors.brightWhite.underline("\n" + message));
}