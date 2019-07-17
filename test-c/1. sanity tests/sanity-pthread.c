#include <pthread.h>
#include <stdio.h>

#define FRAPPU_LINK_1 "pthread"

// Compile this linking with pthread

void *inc_x(void *x_void_ptr) {
	int *x_ptr = (int *)x_void_ptr;
	while(++(*x_ptr) < 100);
	return NULL;
}

int main() {

	int x = 0, y = 0;
	pthread_t inc_x_thread;

	if(pthread_create(&inc_x_thread, NULL, inc_x, &x)) {
		fprintf(stderr, "Error creating thread\n");
		return 1;
	}
	while(++y < 100);
	if(pthread_join(inc_x_thread, NULL)) {
		fprintf(stderr, "Error joining thread\n");
		return 2;
	}

	if (x != y) {
		fprintf(stderr, "Error number mismatch: x is %d and y is %d\n", x, y);
		return 2;
	}

	return 0;

}