<p align="center"><img src="https://github.com/GuilhermeRossato/frappu/blob/master/assets/frappu-logo-heavy-im-fell-english.png?raw=true" alt="Frappu test framework"/></p>
<p align="center">:coffee: Simple test framework for C projects with zero dependencies :coffee:</p>

A minimalist testing framework for projects written with C or C++ programming language.

| Install globally      | Install as dev dependency      | Add to your project |
| --------------------- | ------------------------------ | ------------------- |
| npm i -g frappu       | npm i --save-dev frappu        | npm i frappu --save |

## How does it work

This tool reads your C/C++ file, attempts to compile and run it, then displays each test status neatly.

## Minimal Example

A basic test can be placed at the folder `./test/basic_test.c`:

```c
int main() {
	if (1+1 == 2) {
		return 0;
	}
	return 1;
}
```

To test it you just call the frappu command (you can also attach to your npm's scripts as `test` if you want)

```bash
frappu
```

Your terminal should output something like this:

```
	[ OK ] Basic Test

	1 passed tests
	0 failed tests
```

That means your test worked, go ahead and change your test source file to make the test fail to see the failure mechanism in action.

## How to add to my project

You can add it in three forms, but the cleanest way is to add it as a development dependency to your project (as described by your `package.json` file) by issuing the following npm command:

```
npm install --save-dev frappu
```

Then add a script to your `package.json` so that you can use npm to call the `test` script:

```
"scripts": {
    "test": "frappu"
}
```

Create a simple c file inside a `test` folder like this:

```c
// ./test/first-test.c

int main(int argn, char ** argc) {
  if (1 + 1 == 2) {
    // success
    return 0;
  } else {
    // error
    return 1;
  }
}
```

If you're going to change the `test` folder then you must pass where it is to the `frappu` command as the first parameter. In this case you don't need to, just issue the script from npm in your terminal:

```
npm run test
```

And your test source code will be compiled and executed, its return value will let the tester know if it failed so if it returns 0 then everything is considered okay and your test passed, which should be what happens if you did the above steps correctly.

Then just edit your test file to include your source files and do some fancy operations that you want to test. If at any point your program detects something amiss, just return a non-zero value at main and the test suite will let you know what failed and will propagate the return value.

## More practical example

Suppose you have the following c function in a file called `is_pair.c` inside a `src` folder in your project:

```c
// ./src/is_pair.c

int is_pair(int x) {
    if (x % 2 == 0) {
        return 1;
    } else {
        return 0;
    }
}
```

To test this function with or without frappu you will need to write a tester that uses this script. For this purpose we will put a file named `test_is_pair.c` in a `test` folder:

```c
// ./test/test_is_pair.c

#include "../src/is_pair.c"

int is_pair(int);

int main() {
    int number_to_test = 1;
    int expected_result = 0;
    int actual_result = is_pair(number_to_test);

    if (actual_result != pair_expected_result) {
        printf("Something is wrong!");
        return 1;
    }

    return 0;
}
```

At this point you could compile and execute this test yourself and make sure it returns 0 (indicating that nothing is wrong), that's where this tool comes in: You run `frappu` at the root of your project and watch each test be executed and asserted automatically.

Frappu tries to guess you'll want to compile your code with `gcc -o file file.c`, but sometimes you need to specify a different compile command, that's why we have some defines that allow you to configure it precisely:

```c
// ./test/test_is_pair.c
#include "../src/is_pair.c"

#define FRAPPU_COMPILE_COMMAND "gcc -o test_is_pair test_is_pair.c"
#define FRAPPU_RUN_COMMAND "test_is_pair"
#define FRAPPU_SHOULD_BE_SILENT 0

int is_pair(int);

int main() {
    int number_to_test = 1;
    int pair_expected_result = 0;

    if (is_pair(number_to_test) != pair_expected_result) {
        printf("Oh no! something is wrong!");
        return 1;
    }

    return 0;
}
```

If you run this tool again, nothing will have changed since the directives are the same as the default ones. (except if you are on windows because the executables have a ".exe" sufix and that is automatically guessed, but you get the idea).

Anyways, with these directives you can change how your code is compiled and executed, you can even execute it multiple times with different shell commands:


```c
// ./test/test_is_pair.c
#include "../src/is_pair.c"

#define FRAPPU_COMPILE_COMMAND "gcc -o ispair test_is_pair.c"
#define FRAPPU_RUN_COMMAND "./ispair 1 0", "./ispair 2 1", "./ispair 3 0"

int is_pair(int);

int main(int argn, char ** argc) {
    if (argn != 3) {
        printf("Incorrect parameters, expected 3");
        return 1;
    }

    int number_to_test = argc[1][0] - '0';
    int pair_expected_result = argc[2][0] - '0';

    if (is_pair(number_to_test) != pair_expected_result) {
        printf("Your C implementation of this algorithm failed\n");
        return 1;
    }

    return 0;
}
```

The above code will compile the test once and execute it three times, with different parameters.

You can also change the compile command to whatever you want, including libraries, changing executable (maybe g++ or riscv-gnu-gcc), etc.

## Directives

In-source directives are identifier at tester files that help this tool know how to handle your test file. They begin with `#define` followed by an uppercase string starting with FRAPPU_ and then their parameter(s).

At the moment, there are 3 directives:

 - **FRAPPU_COMPILE_COMMAND**: A string to compile the tester file.
 - **FRAPPU_RUN_COMMAND**: An array of strings to execute the test.
 - **FRAPPU_SHOULD_BE_SILENT**: Wether to consider the test failed if it tries to write to stdout/stderr.

More details about each directive can be found at [their dedicated file](https://github.com/GuilhermeRossato/frappu/blob/master/docs/directives.md).

## Installing and Usage

To start, you must have Node v10+ installed with npm v6+ which you can check by running `node --version` and `npm --version` in your command line.

There are a few ways this tool can be installed and used. There is a list below ordered from the most recommended to the lea:

[Create a new npm project and add `frappu` to it](https://github.com/GuilhermeRossato/frappu/blob/master/docs/add-to-new-npm-project.md) (If you don't have a npm project)

[Add to your existing npm project](https://github.com/GuilhermeRossato/frappu/blob/master/docs/add-to-existing-npm-project.md)

[Installing it and using it globally](https://github.com/GuilhermeRossato/frappu/blob/master/docs/global-install-usage.md)

[Clone it and execute it](https://github.com/GuilhermeRossato/frappu/blob/master/docs/clone-and-execute.md) (This not recommended as it is an outdated way of doing things)

You can also use the `--help` parameter to get basic usage:

```sh
Frappu is a framework for testing C applications

        frappu [options] folderName

Optional Arguments:
        --help             | -h        Shows information about the argument options
        --match <regexp>   | -m <e>    Filter test by file names that passes a RegExp, ignoring others, case insensitive
        --success-code <d> | -c <d>    Changes the default success code indicator from 0 to a specific integer
        --dont-sort        | -s        Stop the default sorting of tests by filename and foldername
        --keep-executables | -k        Does not delete the compiled executables used for tests at the test folder
        --minimal          | -min      Prints as little as possible unless there were errors. Dots for passed, F for failures
        folderName                     The name of the folder the tests are to be found (default "test")

Example: Test all files that starts with a digit in the filename:
  frappu --match ^[0-9] testFolder
(the above will test "./testFolder/1test.c", but wont test "./testFolder/othertest1.c")

For more details and indepth usage, visit https://github.com/GuilhermeRossato/frappu
```

## Size

This tool is as lightweight as I could make it. Using it in your project takes up 23kb (raw). Your production environment doesn't need to contain frappu as it is strictly used for testing or making sure the implementation of your code works.

## Security

This tools takes no attempt to rid you of security problems. Running compiled executables can be dangerous especially if you don't know what it does.

As a rule of thumb if you are testing a "wipe-out-my-default-hard-drive" function or a "send-my-credit-card-info-to-someone-by-email", you should stop using this tool and develop your own testing suite.

This tool automates compiling of c source files for testing and anyone who can write these scripts can introduce malicious code. Make sure you trust whoever wrote these tests.

## Motivation

I feel like C projects need modern testing frameworks, and all of them were too difficult to add, so I made my own.

## That's all folks
