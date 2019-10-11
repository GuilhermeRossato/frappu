const {exec} = require("child_process");

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

module.exports = executeCommandAt;