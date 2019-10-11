# Clone from Github and execute it manually

To start, you must have Node v10+ installed with npm v6+ which you can check by running `node --version` and `npm --version` in your command line.

It's very likely that you are on a unix-like OS, so open up a shell and execute the following:

```
git clone https://github.com/GuilhermeRossato/frappu.git
cd frappu/src
FRAPPU=${pwd}/index.js
echo $FRAPPU
```

This will set a variable called `FRAPPU` only for the current shell, so it will be lost if your close your terminal, to keep it, you must edit your `~/.bashrc` file and add a line setting this variable to it, I'll trust you know how to do it.

Now, whenever you need to run this tool against a folder in your computer, just run:

```
node $FRAPPU ~/my-project-root/test
```

That's it, good luck!