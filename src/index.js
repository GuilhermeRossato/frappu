#! /usr/bin/env node
const {promisify} = require('util');
const {exec} = require('child_process');
const fs = require('fs');

const asyncExec = promisify(exec);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const resolveOrDefault = require('./utils/resolveOrDefault.js');
const snakeCaseToProperString = require('./utils/snakeCaseToProperString.js');

const pathExists = path => new Promise((resolve) => { stat(path).then(resolve.bind(this, true)).catch(resolve.bind(this, false)); });
const isDirectory = path => new Promise((resolve) => { stat(path).then(info => resolve(info.isDirectory())).catch(resolve.bind(this, false)); });
const isFile = path => new Promise((resolve) => { stat(path).then(info => resolve(info.isFile())).catch(resolve.bind(this, false)); });

(async function runTests() {
	const messages = [];
	let prefix = "../test/";
	if (!(await isDirectory(prefix))) {
		prefix = prefix.substr(1);
	}
	let passingTests = 0;
	let failingTests = 0;
	let files;
	try {
		files = await readdir(prefix);
	} catch (err) {
		console.log("Could not list tests in test folder");
		return false;
	}
	console.log("\n");
	for (index in files) {
		const fileName = files[index];
		const filePath = prefix+fileName;
		if (!filePath.endsWith(".c")) {
			continue;
		}
		if (await isDirectory(filePath)) {
			continue;
		}
		const result = await processTestSource(filePath, fileName);

		messages.push({
			title: result.title,
			message: result.error ? result.message : ""
		});

		if (result.error && result.message) {
			failingTests++;
		} else {
			passingTests++;
		}

		console.log(result.title);
	}

	console.log("\n\n\t"+passingTests+" passing tests");
	console.log("\t"+failingTests+" failing tests");

	if (failingTests) {
		console.log("\n");
		for (index in messages) {
			if (!messages[index].message) {
				continue;
			}
			const testNumber = typeof index === "string" ? parseInt(index) + 1 : index + 1;
			console.log("\t"+testNumber+") "+messages[index].title.substr(1)+"\n");
			console.log(messages[index].message+"\n");
		}
	}
})().catch(console.error);

async function processTestSource(filePath, file) {
	const compilation = await compileSource(filePath);

	const fileName = file.substr(0, file.lastIndexOf("."));
	const testName = snakeCaseToProperString(fileName);

	const failTitle = "\t[FAIL] - "+testName;
	const okTitle = "\t[ OK ] - "+testName;

	if (compilation.error) {
		return ({
			error: true,
			title: failTitle,
			message: compilation.message 
		});
	}

	if (!(await isFile(compilation.exePath))) {
		return ({
			error: true,
			title: failTitle,
			message: "Could not find executable at "+compilation.exePath 
		});
	}

	const execution = await executeExecutable(compilation.exeDir, compilation.exeFile);

	if (execution.error || execution.code !== 0) {
		return {
			error: true,
			title: failTitle,
			message: execution.message 
		};
	}

	return {
		error: false,
		title: okTitle
	};
}

async function compileSource(srcPath) {
	const exePath = generateExePathFromSrc(srcPath);
	const srcDir = srcPath.substr(0, srcPath.lastIndexOf("/"));
	const exeDir = exePath.substr(0, srcPath.lastIndexOf("/"));
	const relativeSrcPath = srcPath.substr(srcDir.length+1);
	const relativeExePath = exePath.substr(exeDir.length+1);

	const commandParts = [
		"gcc",
		relativeSrcPath,
		"-o",
		relativeExePath,
		"-fdiagnostics-color=always"
	];

	const command = commandParts.join(" ");

	const result = await executeExecutable(srcDir, command);

	if (result.error) {
		return {
			error: true,
			message: result.message
		};
	}

	return {
		error: false,
		srcDir: srcDir,
		exeDir: exeDir,
		exeFile: relativeExePath,
		exePath: exePath
	};
}

function generateExePathFromSrc(srcPath) {
	const exePrefix = srcPath.substr(0, srcPath.lastIndexOf("."));
	const isWindows = process.platform === "win32";
	const exeSufix = isWindows ? ".exe" : "";
	return exePrefix+exeSufix;
}

function executeExecutable(cwdPath, exePath, timeoutTime = 10000) {
	let result = {
		error: undefined,
		message: undefined,
		code: undefined
	};
	const options = {
		cwd: cwdPath,
		stdio: 'inherit'
	}
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
				if (stdout.endsWith("\n")) {
					console.log(stdout.substr(0, stdout.length-1));
				} else {
					console.log(stdout);
				}
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
		}).on('exit', code => {
			result.code = code;
			if (result.error !== undefined) {
				clearTimeout(timeout);
				if (result.code !== 0) {
					result.message = "Return code "+result.code+" - "+result.message;
				}
				return resolve(result);
			}
		})
	});	
}
