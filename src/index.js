#! /usr/bin/env node

const getAllSourceFilesToBeTested = require("./lib/getAllSourceFilesToBeTested.js");
const getConfigFromArgv = require("./utils/getConfigFromArgv.js");
const path = require("path");
const { isDirectory } = require("./lib/shared.js");

const {exec} = require("child_process");

const config = getConfigFromArgv();

function executeCommandAt(exePath, cwdPath, timeoutTime = 10000) {
	let result = {
		error: undefined,
		message: undefined,
		code: undefined
	};
	const options = {
		cwd: cwdPath,
		stdio: "inherit"
	};
	return new Promise(resolve => {
		let timeout = setTimeout(
			resolve.bind(this, {
				error: true,
				message: "Execution timeout after "+timeoutTime+" ms",
				code: 1
			}),
			timeoutTime
		);
		exec(exePath, options, (err, stdout, stderr) => {

			if (err) {
				result.error = true;
				if (err.stack.trim().startsWith("Error: Command failed: cd") && err.message.includes("gcc")&& err.message.includes(" && ")) {
					result.message = "> "+err.message.substr(err.message.indexOf(" && ")+4).replace("-fdiagnostics-color=always ", "");
				} else {
					result.message = err.stack;
				}
			}

			let output = "";

			if (typeof stdout === "string" && stdout.length && stdout.trim()) {
				output += stdout;
			}

			if (typeof stderr === "string" && stderr.length && stderr.trim()) {
				output += stderr;
				result.error = true;
			}

			if (result.message === undefined) {
				result.message = output;
			}

			if (result.error === undefined) {
				result.error = false;
			}

			if (result.code !== undefined) {
				clearTimeout(timeout);
				if (result.code !== 0) {
					result.message = "Return code "+result.code+" - "+result.message;
				}
				return resolve(result);
			}
		}).on("exit", code => {
			result.code = code;
			if (result.error !== undefined) {
				clearTimeout(timeout);
				if (result.code !== 0) {
					result.message = "Return code "+result.code+" - "+result.message;
				}
				return resolve(result);
			}
		});
	});
}


(async function runTests() {
	const folderRoot = path.resolve(config["folder-name"]);

	if (typeof folderRoot !== "string") {
		throw new Error(`Folder name must be a string, got "${typeof folderRoot}"`);
	}

	if (!(await isDirectory(folderRoot))) {
		throw new Error(`Test directory not found at "${folderRoot}"`);
	}

	const folderList = await getAllSourceFilesToBeTested(folderRoot, config["sort-files"]);

	let executionCount = 0;
	for (let folder of folderList) {
		folder.statuses = [];
		for (let file of folder.files) {
			executionCount++;
			const folderPath = folder.folderPath;
			const compileCommand = file.scripts.compile;
			const compileResult = await executeCommandAt(compileCommand, folderPath);
			if (compileResult.error) {
				folder.statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"error": true,
					"stage": "compilation",
					"message": compileResult.message
				});
				process.stdout.write("F");
				continue;
			}

			const runCommand = file.scripts.run;
			const runResult = await executeCommandAt(runCommand, folderPath);
			if (runResult.error) {
				folder.statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"error": true,
					"stage": "execution",
					"message": runResult.message
				});
				process.stdout.write("F");
				continue;
			}
			if (runResult.message && file.scripts.shouldBeSilent) {
				folder.statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"error": true,
					"stage": "validation",
					"message": "Silent execution returned message unexpectedly: "+runResult.message
				});
				process.stdout.write("F");
				continue;
			}
			folder.statuses.push({
				"folderPath": folderPath,
				"fileName": file.fileName,
				"success": true,
				"stage": "finished"
			});
			process.stdout.write(".");
		}
	}
	const prefix = path.normalize(folderRoot+path.sep+"..");
	if (executionCount) {
		process.stdout.write("\n");
		for (let folder of folderList) {
			if (folder.statuses.length === 0) {
				continue;
			}

			const someFailed = folder.statuses.some(status => status.error);
			const folderLabel = folder.folderPath.substr(prefix.length);

			console.log(`\t[${someFailed ? "F" : " "}] ${folderLabel}`);
			console.log("");
			for (let status of folder.statuses) {
				const fileLabel = status.fileName;
				console.log(`\t\t[${status.error ? "F" : " "}] - ${fileLabel}`);
				status.message && console.log("\n"+status.message);
				console.log("");
			}
		}
	} else {
		if (folderList.length == 1) {
			console.log("There are no source files to be tested in the specified folder.");
		} else {
			console.log("There are no source files to be tested in a total of "+folderList.length+" nested folders.");
		}
	}
})().then(console.log).catch(console.error);