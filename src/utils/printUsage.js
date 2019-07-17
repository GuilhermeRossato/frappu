module.exports = function printUsage() {
	console.log("Frappu is a framework for testing C applications\n");
	console.log(`\t${process.argv[1]} [options] folderName`);
	console.log("\nOptional Arguments:");
	console.log("\t--help             | -h        Shows information about the argument options");
	console.log("\t--success-code [d] | -c [d]    Changes the default success code indicator from 0 to a specific integer");
	console.log("\t--stop-sorting     | -s        Stop the default sorting of tests by filename and foldername");
	console.log("\tfolderName                     The name of the folder the tests are to be found (default \"test\")");
};