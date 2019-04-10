#include <stdlib.h> // exit
#include <stdio.h> // printf

int do_some_checking() {
	int two = 3;
	if (two != 2) {
		printf("Oops! It seems that something is wrong\n");
		exit(1);
	}
}

int main() {
	do_some_checking();
	return 0;
}