const {readdir, isFile, path} = require("./shared.js");
const generateCompileCommandForFile = require("./generateCompileCommandForFile.js");

async function separateFoldersFromFiles(list) {
	const directories = [];
	const files = [];
	await Promise.all(list.map(async function(path) {
		if (await isFile(path)) {
			files.push(path)
		} else {
			directories.push(path);
		}
	}));
	return { directories, files };
}

module.exports = async function getAllSourceFilesToBeTested(originFolderPath, depth = 4, shallSort) {
	const folders = [originFolderPath];
	const results = [];

	while (folders.length >= 1) {
		const folderName = folders.pop();
		const elements = (await readdir(folderName)).map(fileName => folderName + "/" + fileName);
		if (elements.length <= 0) {
			continue;
		}

		const {directories, files} = await separateFoldersFromFiles(elements);

		directories.forEach(line => folders.push(line));

		if (results[folderName]) {
			console.log("Tried to add the same folder twice while getting sources");
			continue;
		}

		var fileList = files.filter(filePath => filePath.toLowerCase().endsWith(".c")).map(filePath => filePath.substr(folderName.length+1));

		results[folderName] = {};
		for (let i = 0; i < fileList.length; i++) {
			const filePath = fileList[i];
			const fullPath = path.join(folderName,filePath);

			if (!await isFile(fullPath)) {
				throw new Error("Source file not found: "+fullPath);
			}
			results[folderName][filePath] = await generateCompileCommandForFile(fullPath);
		}
	}

	if (!shallSort) {
		return results;
	}

	var sortedObject = {};

	var keys = Object.keys(results);

	keys.forEach(key => {
		sortedObject[key] = results[key];
	});

	return sortedObject;
}