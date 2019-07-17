const {promisify} = require('util');
const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');

const resolveOrDefault = require('../utils/resolveOrDefault.js');
const snakeCaseToProperString = require('../utils/snakeCaseToProperString.js');

const asyncExec = promisify(exec);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const getBasename = path.basename;
const getDirname = path.dirname;

const pathExists = path => new Promise((resolve) => { stat(path).then(resolve.bind(this, true)).catch(resolve.bind(this, false)); });
const isDirectory = path => new Promise((resolve) => { stat(path).then(info => resolve(info.isDirectory())).catch(resolve.bind(this, false)); });
const isFile = path => new Promise((resolve) => { stat(path).then(info => resolve(info.isFile())).catch(resolve.bind(this, false)); });
const readFile = (path, encoding  = "utf-8") => new Promise((resolve, reject) => { fs.readFile(path, {encoding: encoding}, function(err, data) { if (err) { console.log("Finally an error reading the file occured! Debug this!", err); return reject(new Error("Could not open file due to error "+(err ? err.errno : "unknown"))); } return resolve(data); }); });

module.exports = {
	path, fs, readFile, resolveOrDefault, getBasename, getDirname, asyncExec, readdir, stat, pathExists, isDirectory, isFile, snakeCaseToProperString
};