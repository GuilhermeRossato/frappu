const {isFile, readFile, getBasename, getDirname} = require("./shared.js");

function generateExePathFromSrc(srcPath) {
	const exePrefix = srcPath.substr(0, srcPath.lastIndexOf("."));
	const isWindows = process.platform === "win32";
	const exeSufix = isWindows ? ".exe" : "";
	return exePrefix+exeSufix;
}

function getCompileCommandForFile(srcPath, extraCommands = []) {
	const exePath = generateExePathFromSrc(srcPath);

	const srcDir = getDirname(srcPath);
	const exeDir = getDirname(exePath);

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

async function generateCompileCommandForFile(filePath) {
	if (typeof filePath !== "string") {
		throw new Error(`Expected file path to be string, got "${typeof filePath}"`);
	}
	if (!(await isFile(filePath))) {
		throw new Error(`Not a valid file at "${filePath}"`);
	}
	let content;

	try {
		content = await readFile(filePath, 'utf-8');
	} catch (err) {
		throw new Error("Could not open file \""+filePath+"\"");
	}

	// Don't waste time parsing files without FRAPPU commands
	if (!content.includes("#define FRAPPU_")) {
		return getCompileCommandForFile(filePath);
	}

	const extraCommands = [];
	content.split("\n").forEach(function(line) {
		if (!line.includes("#define FRAPPU_LINK") && !line.includes("#define FRAPPU_ADD")) {
			return;
		}

		const libraryName = line.substr(
			line.indexOf('"')+1,
			line.lastIndexOf('"')
		);

		if (line.includes("#define FRAPPU_LINK")) {
			return extraCommands.push("-l"+libraryName);
		}

		if (line.includes("#define FRAPPU_ADD")) {
			return extraCommands.push(libraryName);
		}
	});

	return getCompileCommandForFile(filePath, filePath, extraCommands);
}

module.exports = generateCompileCommandForFile;