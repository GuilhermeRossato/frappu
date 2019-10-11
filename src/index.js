#! /usr/bin/env node

const getAllSourceFilesToBeTested = require("./lib/getAllSourceFilesToBeTested.js");
const getConfigFromArgv = require("./utils/getConfigFromArgv.js");
const path = require("path");
const { isDirectory } = require("./lib/shared.js");
const runNormal = require("./runNormal.js");
const runMinimal = require("./runMinimal.js");

const config = getConfigFromArgv();

(async function runTests() {
	const folderRoot = path.resolve(config["folder-name"]);

	if (typeof folderRoot !== "string") {
		throw new Error(`Folder name must be a string, got "${typeof folderRoot}"`);
	}

	if (!(await isDirectory(folderRoot))) {
		throw new Error(`Test directory not found at "${folderRoot}"`);
	}

	const folderList = await getAllSourceFilesToBeTested(folderRoot, config["sort-files"]);

	const prefix = path.normalize(folderRoot+path.sep+"..");
	const executionCount = await (
		config["minimal-mode"] ? runMinimal(prefix, config, folderList) : runNormal(prefix, config, folderList)
	);

	if (!executionCount || executionCount <= 0) {
		if (folderList.length == 1) {
			console.log("There are no source files to be tested in the specified folder.");
		} else {
			console.log("There are no source files to be tested in a total of "+folderList.length+" folders.");
		}
	}

})().catch(console.error);