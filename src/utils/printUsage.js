module.exports = function printUsage() {
	console.log("Frappu is a framework for testing C applications\n");
	console.log(`\t${process.argv[1]} [options] folderName`);
	console.log("\nOptional Arguments:");
	console.log("\t--help             | -h        Shows information about the argument options");
    console.log("\t--match <regexp>   | -m <e>    Filter test by file names that passes a RegExp, ignoring others, case insensitive");
	console.log("\t--success-code <d> | -c <d>    Changes the default success code indicator from 0 to a specific integer");
    console.log("\t--dont-sort        | -s        Stop the default sorting of tests by filename and foldername");
    console.log("\t--keep-executables | -k        Does not delete the compiled executables used for tests at the test folder");
    console.log("\t--minimal          | -min      Prints as little as possible unless there were errors. Dots for passed, F for failures");
	console.log("\tfolderName                     The name of the folder the tests are to be found (default \"test\")");

    console.log("");
    console.log("An example: Test all files that starts with a digit in the filename:");
    console.log("  frappu --match ^[0-9] testFolder");
    console.log("(the above will test \"./testFolder/1test.c\", but won't test \"./testFolder/othertest1.c\")");
    console.log("");
    console.log("For more details and indepth usage, visit https://github.com/GuilhermeRossato/frappu");
    console.log("");
};