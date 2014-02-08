/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	Entry Point File
*/

#include <errno.h>
#include <iostream>
#include <sys/wait.h> 

#include "Directory.h"
#include "clusterEncode.h"

#define STACK_SIZE	(128 * 1024)

//Global Vars

//Data Structures
dirmap		cd_dirs	;	
sigmap		cd_sigs ;
proc_que	enc_que	;
rproc_que	run_que ;

//Semaphores
sem_t		sem_map		;
sem_t		sem_sig		;
sem_t		sem_que		;

bool		verbose = false ;
bool		running = true  ;

size_t		procs	= 10	;

string		mp3_path	; //Path to wav files	

string		wav_path	; //Path to wav files	
int			wav_fd		; //File Descriptor to Wav Files
DIR			*wav_dir	; //DIR to wav files

//Main Application
int main(int argc, char *argv[]) 
{
	char		cmdLine[255]	;
	pthread_t	dir_thread		;
	pthread_t	que_thread		;

	struct	sigaction dirCreate ; //Signal handler for create actions

	//Main
	processCommandLine(argc, argv) ;
	
	debug("Opening " + wav_path) ;

	//Open the WAV output directory
    wav_dir = opendir(wav_path.c_str());
    wav_fd  = dirfd(wav_dir) ;

	debug("Setting up signals for " + wav_path) ;

	//Setup signals
	dirCreate.sa_sigaction = directory_create;
	dirCreate.sa_flags	   = SA_SIGINFO ;

	if(sigaction(SIGIO, &dirCreate, NULL) != 0)
	{
		log("sigaction() call for create signal failed.\n");
		exit(-1);
	}
	
	fcntl(wav_fd, F_SETSIG, SIGIO);
    fcntl(wav_fd, F_NOTIFY, DN_CREATE | DN_MULTISHOT);

	//Semaphore Init
	debug("Initailize Semaphores...") ;

	sem_init(&sem_map, 0, 1);
	sem_init(&sem_que, 0, 1);
	sem_init(&sem_sig, 0, 1);

	debug("Semaphores Initialized") ;

	//Span the thread that watches the directory objects
	pthread_create(dir_thread, NULL, manageDirectories, NULL) ; 
    	  

	//Span the thread to manage the queue
	pthread_create(que_thread, NULL, manageQueue, NULL) ; 

	//Main Process - Reads the command line
    while(running)
    { 
		//Check for input
		if(fgets(cmdLine, 10, stdin) != NULL)
		{
			if(cmdLine[0] == 'Q' ||
			   cmdLine[0] == 'q')
			{
				running = false ;
				break ;
			}
		}

		sleep(5);

    }

	freeAll() ;

    close(wav_fd) ;
}

/*
	Watch the queue and processes as needed
*/
void * manageQueue(void *argv)
{
	while(running)
	{
		sleep(1) ;

		sem_wait(&sem_que) ;
		
		//Startup as many processes as possible
		while(run_que.size() < procs && !enc_que.empty())
		{
			proc_item pi = enc_que.front() ;
			enc_que.pop() ;

			//Span new process
			int cpid ;

			RunningProc *nproc = new RunningProc(pi.first, pi.second) ;

			char **args = nproc->getArgs() ;

			if ((cpid = fork()) == 0)  
			{
				/* Execute the process in a child */
				execv(args[0], args);
		    
				log("Child process could not start.") ;
				return ;
			}

			//Set the pid before we lose it
			run_que[cpid] = nproc ;
			nproc->setPID(cpid) ;
		}

		int pid ;
		debug("Waiting for a child to finish") ;

		pid = waitpid(-1, NULL, WNOHANG) ;

		if(pid != -1)
		{
			//Search running queue
			rproc_que::iterator f = run_que.find(pid) ;

			if(f != run_que.end())
			{
				debug("A process has finished") ;
				(*f).second->finished() ; //Destruction happens here
				run_que.erase(f) ;
			}
		}

		sem_post(&sem_que) ;

	}

	return ;
}

/*
	Check on directories periodically 
	to see if they must update their 
	listings and state
*/
void * manageDirectories(void *argv)
{
	while(running)
	{
		sleep(2) ;

		//Lock the directory list
		sem_wait(&sem_map) ;

		debug("Searching for directories to scan") ;

		for(dirmap::iterator i = cd_dirs.begin() ;
			i != cd_dirs.end() ;
			i++)
		{
			Directory *d = (*i).second ;

			if(d->needScan())
			{
				d->doScan() ;
			}
		}

		//Unlock directory list
		sem_post(&sem_map) ;
	}

	return ;
}

/**
  Take in any inputs and set them in global memory
*/
void processCommandLine(int argc, char *argv[]) 
{
	char ch ; 

	/* Process the command line */
	while((ch = getopt(argc, argv, "vi:o:p:")) != EOF)  
	{
		switch (ch)  
		{
			case 'v': 
				verbose = true;
				break;
			case 'i': 
				wav_path = optarg; 
				break ;
			case 'o' :
				mp3_path = optarg ;
				break ;
			case 'p' :
				procs = atoi(optarg) ; 
				break ;
			default:  
				usage();
				exit(-1);
		}
	}

	if(mp3_path.empty() || wav_path.empty())
	{
		usage() ;
	}

	if(access(wav_path.c_str(), F_OK) != 0)
	{
		log("The path " + wav_path + " does not exist.") ;
		exit(1) ; 
	}

	if(access(mp3_path.c_str(), F_OK) != 0)
	{
		log("The path " + mp3_path + " does not exist.") ;
		exit(1) ; 
	}
}

//Give back all memory
void freeAll()
{
	debug("Stopping Main Monitor") ;
	fcntl(wav_fd, F_NOTIFY, 0);

	sem_wait(&sem_map) ;

	debug("Freeing Memory");

	for(dirmap::iterator i = cd_dirs.begin() ; i != cd_dirs.end() ; i++)
	{
		delete (*i).second ;
	}

	cd_dirs.clear() ;

	sem_post(&sem_map) ;

	debug("Freeing Semaphores");
	sem_destroy(&sem_map) ;
	sem_destroy(&sem_sig) ;
	sem_destroy(&sem_que) ;
}

//Print how to use this program
void usage()
{
	printf("Specify the input file with -i,\n") ;
	printf("the output with -o, the number of procs with -p, \n") ;
	printf("and verbose with -v.\n") ;

	exit(1) ;
}

//Print a message for debugging
void debug(string msg)
{
	if(verbose)
	{
		log(msg) ;
	}
}

//Print a message to stdout
void log(string msg)
{
	cout << "[Encoder] " << msg << endl ;
}

//Signal handlers stripped out for clarity
#include "signal_handlers.cpp"

