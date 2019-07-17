#! /usr/bin/env node

const getAllSourceFilesToBeTested = require("./lib/getAllSourceFilesToBeTested.js");
const getConfigFromArgv = require("./utils/getConfigFromArgv.js");
const path = require("path");
const { isDirectory } = require("./lib/shared.js");

const config = getConfigFromArgv();


(async function runTests() {
	const folderRoot = path.resolve(config["folder-name"]);

	if (typeof folderRoot !== "string") {
		throw new Error(`Folder name must be a string, got "${typeof folderRoot}"`);
	}

	if (!(await isDirectory(folderRoot))) {
		throw new Error(`Test directory not found at "${folderRoot}"`);
	}

	const messages = [];

	let passingTests = 0;
	let failingTests = 0;

	let testGroups;

	testGroups = await getAllSourceFilesToBeTested(
		folderRoot,
		config["file-directory-max-depth"],
		config["sort-files"]
	);

	console.log(testGroups);

	for (let folderPath in testGroups) {
		const prefix = path.resolve(folderRoot+"/..");

		if (!folderPath.startsWith(prefix)) {
			return console.warn(`Warning: folder does not start from expected origin: ${prefix}`);
		}
		console.log("\n   - "+folderPath.substr(prefix.length));
		for (let fileName in testGroups[folderPath]) {
			console.log("       [ X ] " + fileName);
		}
	}

})().then(console.log).catch(console.error);