/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	Main Header File
*/
#include <unistd.h>
#include <sys/types.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>

#include <string>
#include <map>
#include <queue>
#include <list>

#include "RunningProc.h"

using namespace std ;

//Type Definitions
typedef map<string, Directory *>		dirmap		;
typedef map<int,	string>				sigmap		;

typedef pair<int, Directory *>			proc_item	;
typedef queue<proc_item>				proc_que	;

typedef map<int, RunningProc*>			rproc_que	;

//Function Prototypes
void directory_create(int sig, siginfo_t *spI, void *buf) ; //Handle the file creation signals

void * manageQueue(void *) ;								//Check for process terminication and creation
void * manageDirectories(void *) ;							//Check for directory updates

void processCDDir(int fd)	;								//Process a child directory
bool registerHandler(string dir_name, int fd) ;				//Arranges for that directory to recieve signals
void removeHandler(int fd) ;								//Remove the handle association

void processCommandLine(int argc, char *argv[]) ;			//Process the passed in args

void usage() ;												//Print how to use this program

void debug(string msg) ;									//Print a message if verbose is on
void log(string msg) ;										//Log a message

void freeAll()		;										//Ensure all memory is given back



