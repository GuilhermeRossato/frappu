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
                    "error": true,
                    "stage": "compilation",
                    "message": compileResult.message
                });
                failureCount++;
                process.stdout.write("F");
                continue;
            }

            const runCommand = file.scripts.run;
            const runResult = await executeCommandAt(runCommand, folderPath);
            if (runResult.error) {
                statuses.push({
                    "folderPath": folderPath,
                    "fileName": file.fileName,
                    "error": true,
                    "stage": "execution",
                    "message": runResult.message
                });
                failureCount++;
                process.stdout.write("F");
                continue;
            }
            if (runResult.message && file.scripts.shouldBeSilent) {
                statuses.push({
                    "folderPath": folderPath,
                    "fileName": file.fileName,
                    "error": true,
                    "stage": "validation",
                    "message": "Silent execution returned message unexpectedly: "+runResult.message
                });
                failureCount++;
                process.stdout.write("F");
                continue;
            }
            statuses.push({
                "folderPath": folderPath,
                "fileName": file.fileName,
                "success": true,
                "stage": "finished"
            });
            successCount++;
            process.stdout.write(".");
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
        console.log("Summary:")
        console.log(`${successCount} tests passed`);
        console.log(`${failureCount} tests failed`);
        console.log("");
        console.log("Error Details:");
        for (let folder of folderStatus) {
            const someFailed = folder.statuses.some(status => status.error);
            if (!someFailed) {
                continue;
            }
            const folderLabel = folder.folderPath.substr(prefix.length);
            console.log(`\t- ${folderLabel}`);
            console.log("");
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
    }
    return executionCount;
}

module.exports = runMinimal;