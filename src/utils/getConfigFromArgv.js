module.exports = (function getConfigFromCommandLineArguments() {
	const configPairs = {
		"folder-name": "test",
		"success-indicator-code": 0,
		"file-directory-max-depth": 4,
		"sort-files": true
	}
	for (let i = 2; i < process.argv.length; i++) {
		if (process.argv[i] == "--help" || process.argv[i] == "--h") {
			require("./printUsage.js")();
			process.exit(0);
		} else if (process.argv[i] == "--stop-sorting" || process.argv[i] == "-s") {
			configPairs["sort-files"] = false;
		} else if (process.argv[i] == "--success-code" || process.argv[i] == "-c") {
			i++;
			if (i >= process.argv.length || isNaN(parseInt(process.argv[i]))) {
				throw new Error("The command line argument --success-code must be preceded by an integer");
			}
			configPairs["success-indicator-code"] = parseInt(process.argv[i]);
		} else if (process.argv[i] == "--depth" || process.argv[i] == "-d") {
			i++;
			if (i >= process.argv.length || isNaN(parseInt(process.argv[i]))) {
				throw new Error("The command line argument --depth must be preceded by an integer");
			}
			configPairs["success-indicator-code"] = parseInt(process.argv[i]);
		} else {
			configPairs["folder-name"] = process.argv[i];
		}
	}
	return configPairs;
});