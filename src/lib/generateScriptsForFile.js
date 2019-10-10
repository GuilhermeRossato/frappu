const {isFile, readFile, getBasename, getDirname} = require("./shared.js");

function generateExePathFromSrc(srcPath) {
	const exePrefix = srcPath.substr(0, srcPath.lastIndexOf("."));
	const isWindows = process.platform === "win32";
	const exeSufix = isWindows ? ".exe" : "";
	return exePrefix+exeSufix;
}

function getDefaultCompileCommand(srcPath, extraCommands = []) {
	const exePath = generateExePathFromSrc(srcPath);

	//const srcDir = getDirname(srcPath);
	//const exeDir = getDirname(exePath);

	const relativeSrcPath = getBasename(srcPath);
	const relativeExePath = getBasename(exePath);

	const commandParts = [
		"gcc",
		relativeSrcPath
	];

	commandParts.concat(extraCommands);

	commandParts.concat([
		"-o",
		relativeExePath,
		"-fdiagnostics-color=always"
	]);

	return commandParts.join(" ");
}

function generateDefaultScripts(srcPath) {
	const originalExeName = getBasename(generateExePathFromSrc(srcPath));

	const prefixedExeName = "frappu-"+originalExeName.replace(/\s/g, '_');

	const originalSrcName = getBasename(srcPath);
	const treatedSrcName = originalSrcName.includes(" ") ? `"${originalSrcName}"` : originalSrcName;

	const compile = [
		"gcc",
		treatedSrcName,
		"-o",
		prefixedExeName,
		"-fdiagnostics-color=always"
	];

	const run = [
		prefixedExeName
	];

	return {
		"compile": compile.join(" "),
		"run": run.join(" "),
		"shouldBeSilent": false
	}
}

async function generateScriptsForSource(filePath, content) {
	const result = generateDefaultScripts(filePath);

	// Exit early for files without FRAPPU commands
	if (!content.includes("FRAPPU_")) {
		return result;
	}

	const lines = content.split("\n");

	for (let i = 0 ; i < lines.length; i++) {
		const line = lines[i].trim().replace(/\s\s+/g, ' ').trim();

		if (!line.startsWith("#define")) {
			continue;
		}

		if (
			!line.includes("FRAPPU_COMPILE_COMMAND") &&
			!line.includes("FRAPPU_RUN_COMMAND") &&
			!line.includes("FRAPPU_SHOULD_BE_SILENT")
		) {
			continue;
		}

		if (line.startsWith("//") || (line.includes("//") && line.indexOf("//") < line.indexOf("#define"))) {
			continue; // Probably doesn't match anything, but left just to make sure
		}


		let endIndex = 0;

		const startIndex = line.indexOf("\"")+1;
		const finalIndex = line.lastIndexOf("\"");
		const parameter = line.includes("\"") ? line.substr(startIndex,finalIndex).replace(/\\\"/g, "\"") : null;


		if (line.startsWith("#define FRAPPU_COMPILE_COMMAND ")) {
			result["compile"] = parameter;
			continue;
		}

		if (line.startsWith("#define FRAPPU_RUN_COMMAND ")) {
			result["run"] = parameter;
			continue;
		}

		if (line.startsWith("#define FRAPPU_SHOULD_BE_SILENT")) {
			if (
				line.startsWith("#define FRAPPU_SHOULD_BE_SILENT 0") ||
				line.startsWith("#define FRAPPU_SHOULD_BE_SILENT false") ||
				line.startsWith("#define FRAPPU_SHOULD_BE_SILENT \"false\"")
			) {
				result["shouldBeSilent"] = false;
			} else if (
				line.startsWith("#define FRAPPU_SHOULD_BE_SILENT 1") ||
				line.startsWith("#define FRAPPU_SHOULD_BE_SILENT true") ||
				line.startsWith("#define FRAPPU_SHOULD_BE_SILENT \"true\"")
			) {
				result["shouldBeSilent"] = true;
			} else {
				throw new Error(`Unknown frappu parameter value at line ${i}: ${JSON.stringify(line.length < 100 ? line : (line.substr(0, 99)+"..."))}`);
			}
			continue;
		}

		throw new Error(`Unknown frappu command at line ${i}: ${JSON.stringify(line.length < 100 ? line : (line.substr(0, 99)+"..."))}`);
	}

	return result;
}

async function generateScriptsForFile(filePath) {
	if (typeof filePath !== "string") {
		throw new Error(`Expected file path to be string, got "${typeof filePath}"`);
	}
	if (!(await isFile(filePath))) {
		throw new Error(`Not a valid file at "${filePath}"`);
	}
	let content;

	try {
		content = await readFile(filePath, "utf8");
	} catch (err) {
		err.message = "Could not read file \""+filePath+"\": "+err.message;
		throw err;
	}

	return await generateScriptsForSource(filePath, content);
}

module.exports = generateScriptsForFile;