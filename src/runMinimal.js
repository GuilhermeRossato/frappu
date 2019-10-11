const executeCommandAt = require("./executeCommandAt.js");

async function runMinimal(prefix, config, folderList) {
	let executionCount = 0;
	let failureCount = 0;
	let successCount = 0;
	const folderStatus = [];

	for (let folder of folderList) {
		const statuses = [];
		for (let file of folder.files) {
			executionCount++;
			const folderPath = folder.folderPath;
			const compileCommand = file.scripts.compile;
			const compileResult = await executeCommandAt(compileCommand, folderPath);
			if (compileResult.error) {
				statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"command": compileCommand,
					"error": true,
					"stage": "compilation",
					"message": compileResult.message
				});
				failureCount++;
				process.stdout.write("F");
				continue;
			}

			let isSuccess = true;
			const runCommandList = file.scripts.run;
			for (let runCommand of runCommandList) {
				const runResult = await executeCommandAt(runCommand, folderPath);
				if (runResult.error) {
					statuses.push({
						"folderPath": folderPath,
						"fileName": file.fileName,
						"command": runCommand,
						"error": true,
						"stage": "execution",
						"message": runResult.message
					});
					process.stdout.write("F");
					isSuccess = false;
					break;
				}
				if (runResult.message && file.scripts.shouldBeSilent) {
					statuses.push({
						"folderPath": folderPath,
						"fileName": file.fileName,
						"command": runCommand,
						"error": true,
						"stage": "validation",
						"message": "Silent execution returned message unexpectedly: "+runResult.message
					});
					process.stdout.write("F");
					isSuccess = false;
					break;
				}
			}

			if (isSuccess) {
				statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"command": runCommandList,
					"success": true,
					"stage": "finished"
				});
				successCount++;
				process.stdout.write(".");
			} else {
				failureCount++;
				continue;
			}
		}
		folderStatus.push(statuses);
	}
	if (successCount + failureCount !== executionCount) {
		throw new Error(
			`There were ${successCount} successes, ${failureCount} failures, but the sum `+
			`(${successCount+failureCount}) does not match the test count (${executionCount})`
		);
	}
	if (failureCount > 0) {
		process.stdout.write("\n");
		console.log("  Error Details:");
		for (let folder of folderStatus) {
			const someFailed = folder.statuses.some(status => status.error);
			if (!someFailed) {
				continue;
			}
			const folderLabel = folder.folderPath.substr(prefix.length);
			console.log(`\t- ${folderLabel}`);
			process.stdout.write("\n");
			for (let statuses of folder.statuses) {
				if (!statuses.error) {
					continue;
				}
				const fileLabel = status.fileName;
				console.log(`\t\t[${status.error ? "F" : " "}] - ${fileLabel}`);
				if (status.message) {
					console.log("\n"+status.message);
				} else if (status.error && !status.message) {
					console.log("\n"+"(The test failed without message)");
				}
			}
		}
		process.stdout.write("\n");
		console.log(`\t${successCount > 0 ? successCount : "No"} passed tests`);
		console.log(`\t${failureCount > 0 ? failureCount : "No"} failed tests`);
	}
	return executionCount;
}

module.exports = runMinimal;