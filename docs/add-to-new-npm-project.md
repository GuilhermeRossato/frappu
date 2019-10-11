## Adding frappu to a new NPM project

If you don't yet have a npm project, don't worry: it's all about a `package.json` file describing the project and its dependencies and a `node_modules` folder with the project dependencies (the folder should not be added to your git repository, if you have one).

To start, you must have Node v10+ installed with npm v6+ which you can check by running `node --version` and `npm --version` in your command line.

Open your shell at your project root and execute:

```sh
cd my-project
npm init -y
npm install frappu --save-dev
```

A new JSON file at `package.json` will have been created, you'll have to edit it and change the current `test` script to call frappu:

```diff
 {
   "name": "test",
   "version": "1.0.0",
   "description": "",
   "main": "index.js",
   "scripts": {
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "test": "frappu"
   },
   "keywords": [],
   "author": "",
   "license": "ISC",
   "devDependencies": {
     "frappu": "^1.0.0"
   }
 }
```

You can now run frappu and test your files at your command line:

```sh
npm test
```

If your tests aren't at the default `test` folder, you can either call the command with the folder:

```sh
npm test -- myfolder
```

Or edit `package.json` to always call frappu with the folder as parameter:

```json
{
  "name": "test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "frappu myfolder"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "frappu": "^0.8.0"
  }
}
```

Then you can continue to call `npm test` and the parameters will already be passed internally.

That's it, you should either see error messages or passing tests.
