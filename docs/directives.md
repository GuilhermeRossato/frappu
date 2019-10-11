# Directives

In-source directives are identifier at tester files that help this tool know how to handle your test file. They begin with `#define` followed by an uppercase string starting with FRAPPU_ and then their parameter(s).

They can be at any line of your c/c++ tester file as long as they are not duplicated.

They have absolutely no impact on your resulting executable since the compile 'strips' them away, they are only used by this tool to figure out how to compile/run/interpet your tester file.

## FRAPPU_COMPILE_COMMAND

It is a string with the shell command used to compile your tester file. Default: `gcc -o <test_file_name>[.exe] <test_file_name>.c`

The compile command will be executed at the tester file source folder, so if it's at `./test/file.c`, it will be executed from `./test/`.

### Examples:

Compile a file in `./test/my_file.c` with riscv gcc:
```c
#define FRAPPU_COMPILE_COMMAND "riscv-gnu-gcc my_file.c -o my_test_executable"
```

Compile a file with makefile:
```c
#define FRAPPU_COMPILE_COMMAND "make"
```

## FRAPPU_RUN_COMMAND

It's a string (or a list separated by commas) of shell commands to execute the script at the folder it's currently at given that the compile command worked. Default: `<test_file_name>[.exe]`

### Examples:

Just runs the executable:
```c
#define FRAPPU_RUN_COMMAND "./my_test_executable"
```

Set the executable permission and execute it:
```c
#define FRAPPU_RUN_COMMAND "chmod +x ./my_test_executable && ./my_test_executable"
```

Runs two separated sequential commands to set the permission and execute the file
```c
#define FRAPPU_RUN_COMMAND "chmod +x ./my_test_executable", "./my_test_executable"
```

Run the executable and print something if it works:
```c
#define FRAPPU_RUN_COMMAND "./my_test_executable && echo \"it worked!\""
```

Disable the run command entirely (will only test compilation)
```c
#define FRAPPU_RUN_COMMAND ""
```

## FRAPPU_SHOULD_BE_SILENT

A boolean indicator of wether this tool should expect this test to print something to stdout or stderr. The default is non-silent test.

If a test deemed to be silent (by including this directive) prints something, this tool will just assume it failed and that is an error message of sorts.

It can be either (empty), `1`, `true`, `"true"` to indicate a silent test, and `0`, `false` or `"false"`, to indicate a test that is not silent.

Note that a non-silent code can print freely without this tool considering it a failure.

### Examples:

Expect it to be silent:
```c
#define FRAPPU_SHOULD_BE_SILENT "true"
```

Expect it not to be silent:
```c
#define FRAPPU_SHOULD_BE_SILENT "false"
```

Same thing as last example but with a zero to indicate false:
```c
#define FRAPPU_SHOULD_BE_SILENT 0
```