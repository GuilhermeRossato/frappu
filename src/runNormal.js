const executeCommandAt = require("./executeCommandAt.js");

function printTestConclusion(fileLabel, isError, message) {
	console.log(`\t\t[${isError ? "FAIL" : " OK "}] - ${fileLabel}`);
	if (message) {
		console.log("\n"+message);
	} else if (isError && !message) {
		console.log("\n"+"(The test failed without message)");
	}
	if (isError) {
		process.stdout.write("\n");
	}
}

async function runNormal(prefix, config, folderList) {
	let executionCount = 0;
	let failureCount = 0;
	let successCount = 0;

	for (let folder of folderList) {
		folder.statuses = [];

		if (!folder.files || folder.files.length === 0) {
			continue;
		}

		const folderLabel = folder.folderPath.substr(prefix.length);
		console.log(`\t- ${folderLabel}`);
		process.stdout.write("\n");

		for (let file of folder.files) {
			executionCount++;

			const folderPath = folder.folderPath;
			const compileCommand = file.scripts.compile;
			const compileResult = await executeCommandAt(compileCommand, folderPath);
			const fileLabel = file.fileName;

			if (compileResult.error) {
				folder.statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"command": compileCommand,
					"error": true,
					"stage": "compilation",
					"message": compileResult.message
				});
				failureCount++;
				printTestConclusion(fileLabel, true, folder.statuses[folder.statuses.length-1].message);
				continue;
			}

			let isSuccess = true;
			let resultAggregate = "";
			const runCommandList = file.scripts.run;
			for (let runCommand of runCommandList) {
				const runResult = await executeCommandAt(runCommand, folderPath);
				if (runResult.error) {
					folder.statuses.push({
						"folderPath": folderPath,
						"fileName": file.fileName,
						"command": runCommand,
						"error": true,
						"stage": "execution",
						"message": runResult.message
					});
					printTestConclusion(fileLabel, true, folder.statuses[folder.statuses.length-1].message);
					isSuccess = false;
					break;
				}
				if (runResult.message && file.scripts.shouldBeSilent) {
					folder.statuses.push({
						"folderPath": folderPath,
						"fileName": file.fileName,
						"command": runCommand,
						"error": true,
						"stage": "validation",
						"message": "Silent execution returned message unexpectedly: "+runResult.message
					});
					printTestConclusion(fileLabel, true, folder.statuses[folder.statuses.length-1].message);
					isSuccess = false;
					break;
				}
				resultAggregate += runResult.message;
			}
			if (isSuccess) {
				folder.statuses.push({
					"folderPath": folderPath,
					"fileName": file.fileName,
					"command": runCommandList,
					"success": true,
					"stage": "finished",
					"message": resultAggregate
				});
				successCount++;
				printTestConclusion(fileLabel, false, folder.statuses[folder.statuses.length-1].message);
			} else {
				failureCount++;
				continue;
			}
		}
		process.stdout.write("\n");
	}
	if (successCount + failureCount !== executionCount) {
		throw new Error(
			`There were ${successCount} successes, ${failureCount} failures, but the sum `+
			`(${successCount+failureCount}) does not match the test count (${executionCount})`
		);
	}
	console.log(`\t${successCount > 0 ? successCount : "No"} passed tests`);
	console.log(`\t${failureCount > 0 ? failureCount : "No"} failed tests`);

	return executionCount;
}

module.exports = runNormal;