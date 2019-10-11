const {isFile, readFile, getBasename} = require("./shared.js");

function generateExePathFromSrc(srcPath) {
	const exePrefix = srcPath.substr(0, srcPath.lastIndexOf("."));
	const isWindows = process.platform === "win32";
	const exeSufix = isWindows ? ".exe" : "";
	return exePrefix+exeSufix;
}

function generateDefaultScripts(srcPath) {
	const originalExeName = getBasename(generateExePathFromSrc(srcPath));

	const prefixedExeName = "frappu-"+originalExeName.replace(/\s/g, "_");

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
		"run": [run.join(" ")],
		"shouldBeSilent": false
	};
}

// A state machine approach to interpret a line with a directive
function interpretDirective(string, lineIndex, filePath) {
	let state = "starting";
	let key = "";
	let parameter = [""];

	for (let i = 0; i < string.length; i++) {
		const c = string[i];
		if (state === "starting") {
			if (c === " ") {
				state = "getting-key";
			} else {
				throw new Error(`Unexpected character (${c}) between #define and directive name at ${filePath}:${lineIndex} (state ${state})`);
			}
		} else if (state === "getting-key") {
			if (c === " ") {
				state = "getting-parameter-out-quotes";
			} else if (
				(c >= "A" && c <= "Z") ||
				(c >= "a" && c <= "z") ||
				(c >= "0" && c <= "9") ||
				(c === "_")
			) {
				key += c;
			} else {
				throw new Error(`Unexpected character (${c}) at the directive name at ${filePath}:${lineIndex} (state ${state})`);
			}
		} else if (state === "getting-parameter-out-quotes") {
			if (c === "\"") {
				state = "getting-parameter-in-quotes";
				parameter[parameter.length-1] += c;
			} else {
				parameter[parameter.length-1] += c;
			}
		} else if (state === "getting-parameter-in-quotes") {
			if (c === "\\" && string[i+1] === "\"") {
				i++;
				parameter[parameter.length-1] += "\"";
			} else if (c === "\"" && string[i-1] !== "\\") {
				state = "just-quit-quote";
				parameter[parameter.length-1] += c;
			} else if (i+1 >= string.length) {
				throw new Error(`Unexpected end of line at directive value at ${filePath}:${lineIndex} (state ${state})`);
			} else {
				parameter[parameter.length-1] += c;
			}
		} else if (state === "just-quit-quote") {
			if (c === " ") {
				continue;
			} else if (c === ",") {
				parameter.push("");
				state = "just-passed-comma";
			} else {
				throw new Error(`Unexpected character (${c}) inbetween directive values at ${filePath}:${lineIndex} (state ${state})`);
			}
		} else if (state === "just-passed-comma") {
			if (c === " ") {
				continue;
			} else if (c === "\"") {
				state = "getting-parameter-in-quotes";
				parameter[parameter.length-1] += c;
			} else {
				throw new Error(`Unexpected character (${c}) inbetween directive values at ${filePath}:${lineIndex} (state ${state})`);
			}
		}
	}

	if (parameter[parameter.length-1] === "" || parameter[parameter.length-1] === "\"\"") {
		parameter.pop();
	}

	parameter = parameter.map(value => (value[0] === "\"" && value[value.length-1] === "\"") ? value.substring(1, value.length-1) : value);

	if (parameter.length === 0) {
		parameter = null;
	} else if (parameter.length === 1) {
		parameter = parameter[0];
	}

	key = key.toUpperCase();

	return { key, parameter };
}

async function generateScriptsForSource(filePath, content) {
	const result = generateDefaultScripts(filePath);

	// Exit early for files without FRAPPU commands
	if (!content.includes("FRAPPU_")) {
		return result;
	}

	const lines = content.split("\n");

	for (let i = 0 ; i < lines.length; i++) {
		const line = lines[i].trim().replace(/\s\s+/g, " ").trim();

		if (!line.toLowerCase().startsWith("#define frappu_")) {
			continue;
		}

		const {key, parameter} = interpretDirective(line.substr("#define".length), i, filePath);

		if (key === "FRAPPU_COMPILE_COMMAND") {
			if (parameter instanceof Array) {
				throw new Error(`Compile command cannot be an array at line ${i}`);
			} else if (typeof parameter !== "string") {
				throw new Error(`Compile command cannot be of type ${typeof parameter} at line ${i}`);
			} else {
				result["compile"] = parameter;
			}
			continue;
		}

		if (key === "FRAPPU_RUN_COMMAND" || key === "FRAPPU_RUN_COMMANDS") {
			if (parameter instanceof Array) {
				result["run"] = parameter;
			} else if (typeof parameter === "string") {
				result["run"] = [parameter];
			} else {
				throw new Error(`Run command cannot be of type ${typeof parameter} at line ${i}`);
			}
			continue;
		}

		if (key === "FRAPPU_SHOULD_BE_SILENT") {
			if (parameter === "0" || parameter.toLowerCase() === "false") {
				result["shouldBeSilent"] = false;
			} else if (parameter === "1" || parameter.toLowerCase() === "true") {
				result["shouldBeSilent"] = true;
			} else {
				throw new Error(`Unknown frappu parameter value at ${filePath}:${i} ${JSON.stringify(line.length < 100 ? line : (line.substr(0, 99)+"..."))}`);
			}
			continue;
		}

		throw new Error(`Unknown frappu directive "${key}" at ${filePath}:${i} ${JSON.stringify(line.length < 100 ? line : (line.substr(0, 99)+"..."))}`);
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