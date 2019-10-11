## Adding frappu to a existing NPM project

To start, you must have Node v10+ installed with npm v6+ which you can check by running `node --version` and `npm --version` in your command line.

Open an administrative shell (sudo on linux) and execute the following:

```sh
npm install -g frappu
```

Then, whenever you need to test a project, just navigate to it and run frappu directly (administrative shell is no longer necessary):

```
cd myproject
frappu
```

That's it, you should either see error messages or passing tests.
