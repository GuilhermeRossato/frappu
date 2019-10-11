## Adding frappu to a existing NPM project

To start, you must have Node v10+ installed with npm v6+ which you can check by running `node --version` and `npm --version` in your command line.

Open your shell at your project root and execute:

```sh
npm install frappu --save-dev
```

Your JSON file will have been modified to include `frappu` as a development dependency and you should edit the `package.json` file and change your `test` script to call frappu:

```diff
 {
  ...
   "scripts": {
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "test": "frappu"
   },
   ...
   "devDependencies": {
     ...
     "frappu": "^1.0.0"
   },
   ...
 }
```

You can now run frappu and test your files at your command line:

```sh
npm test
```

If your tests they aren't at the default `test` folder, you can either call the command with the folder:

```sh
npm test -- myfolder
```

Or the recommended way: edit `package.json` to call frappu with your folder:

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

