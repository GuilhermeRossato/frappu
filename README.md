<p align="center"><img src="https://github.com/GuilhermeRossato/frappu/blob/master/assets/frappu-logo-heavy-im-fell-english.png?raw=true" alt="Frappu test framework"/></p>
<p align="center">:coffee: Simple test framework for C projects with zero dependencies :coffee:</p>

An incomplete testing framework for projects written with C programming language and compiled with GCC

| Install globally      | Install as dev dependency      | Add to your project | 
| --------------------- | ------------------------------ | ------------------- |
| npm i -g frappu       | npm i --save-dev frappu        | npm i frappu --save |

## Architecture

For your system to be able to run this tool, you must have gcc installed and accessible (its path in the environment path)

The tool looks for `.c` files inside your `test` folder and attempts to compile each one with a simple `gcc [file.c] -o [file]` and executes it, checking if it either wrote to stderr or returned a non-zero code to determine if your test failed or succeded.

## Motivation

C projects don't have testing frameworks, which makes it difficult to create and reason about big projects.

## Usage

You can either put the script on your package's `test` script or run it directly (if installed globally):

```bash
frappu
```

This command will process each test it finds on the 'test' folder

After installing, just run the following (or put in a)


## Example test

Then, you may put each `.c` source file at your test folder, for example, a basic test file would be at `./test/basic_test.c`:

```c
int main() {
	if (1+1 == 2) {
		return 0;
	}
	return 1;
}
```

Then, run the utility function:
```bash
frappu
```

Your terminal should output something like this:

```
	[ OK ] Basic Test

	1 passed tests
	0 failed tests
```

That means your test worked! Go ahead and change your source file to make the test fail to see the failure mechanism in action

## That's all folks
