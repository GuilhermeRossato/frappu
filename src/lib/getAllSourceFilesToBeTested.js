const {readdir, isFile, path} = require("./shared.js");
const generateScriptsForFile = require("./generateScriptsForFile.js");

async function separateFoldersFromFiles(list) {
	const directories = [];
	const files = [];
	await Promise.all(list.map(async function(path) {
		if (await isFile(path)) {
			files.push(path);
		} else {
			directories.push(path);
		}
	}));
	return { directories, files };
}

async function getAllSourceFilesToBeTested(originFolderPath, sortFiles) {
	const folders = [originFolderPath];
	const results = [];

	while (folders.length >= 1) {
		const folderName = folders.pop();
		const elements = (await readdir(folderName)).map(fileName => folderName + path.sep + fileName);
		if (elements.length <= 0) {
			continue;
		}

		const {directories, files} = await separateFoldersFromFiles(elements);

		directories.forEach(line => folders.push(line));

		if (results[folderName]) {
			console.log("Tried to add the same folder twice while getting sources");
			continue;
		}

		const sourcePathList = files.filter(filePath => filePath.toLowerCase().endsWith(".c"));

		const sourceFilenames = sourcePathList.map(filePath => filePath.substr(folderName.length+1));

		const fileList = sourceFilenames;

		let fileDescriptors = [];

		for (let i = 0; i < fileList.length; i++) {
			const fileName = fileList[i];
			const fullPath = path.join(folderName, fileName);
			const scripts = await generateScriptsForFile(fullPath);
			if (scripts.skip) {
				continue;
			}
			fileDescriptors.push({
				"fileName": fileName,
				"scripts": scripts
			});
		}
		results.push({
			"folderPath": folderName,
			"files": sortFiles ? fileDescriptors.sort((a,b) => a.fileName > b.fileName) : fileDescriptors
		});
	}

	return sortFiles ? results.sort((a, b) => a.folderPath > b.folderPath) : results;
};

module.exports = getAllSourceFilesToBeTested;