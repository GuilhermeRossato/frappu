module.exports = (function getConfigFromCommandLineArguments() {
	// Set Default Values
	const configPairs = {
		"folder-name": "test",
		"success-indicator-code": 0,
		"sort-files": true,
		"regexp-filter": null,
		"minimal-mode": false
	};
	// Decode the parameters
	for (let i = 2; i < process.argv.length; i++) {
		if (process.argv[i] == "--help" || process.argv[i] == "--h" || process.argv[i] == "/?") {
			require("./printUsage.js")();
			process.exit(0);
		} else if (process.argv[i] == "--version" || process.argv[i] == "--v" || process.argv[i] == "/v") {
			console.log("frappu framework v1.0.1 (2019)");
			process.exit(0);
		} else if (process.argv[i] == "--dont-sort" || process.argv[i] == "-s") {
			configPairs["sort-files"] = false;
		} else if (process.argv[i] == "--keep-executables" || process.argv[i] == "-k") {
			configPairs["keep-executables"] = false;
		} else if (process.argv[i] == "--minimal" || process.argv[i] == "-min") {
			configPairs["minimal-mode"] = false;
		} else if (process.argv[i] == "--match" || process.argv[i] == "-m") {
			i++;
			if (i >= process.argv.length) {
				throw new Error(`The command line argument ${process.argv[i]} must be preceded by a valid RegExp`);
			}
			configPairs["regexp-filter"] = new RegExp(process.argv[i], "gi");
		} else if (process.argv[i] == "--success-code" || process.argv[i] == "-c") {
			i++;
			if (i >= process.argv.length || isNaN(parseInt(process.argv[i]))) {
				throw new Error(`The command line argument ${process.argv[i]} must be preceded by an integer`);
			}
			configPairs["success-indicator-code"] = parseInt(process.argv[i]);
		} else {
			configPairs["folder-name"] = process.argv[i];
		}
	}
	return configPairs;
});