/** 
	The Disk Ripper
	
	February 2005, Matthew Hall 
	
	Read a file with list of devices; e.g. /dev/hdc
	then run CDA utilitly on each
*/ 

#include	<stdio.h> 
#include	<stdlib.h> 
#include	<unistd.h> 
#include	<string.h> 
#include	<errno.h> 
#include	<sys/wait.h> 

#include	"diskRip.h"
#include	"batch.h"

/** Main */ 
int main(int argc, char *argv[]) 
{ 
	int		ch			; 
	 
	char	*listname	= NULL ; 

    /* Set some defaults */
    verbose		= 0  ;
	max_procs	= 10 ;
	rip_proc	= "output_cda" ;

    /** Set Global Program Information */
	prog_name = argv[0] ; 

	/* Process the command line */
	while((ch = getopt(argc, argv, "nvf:")) != EOF)  
	{
		switch (ch)  
		{
			case 'n':
				max_procs = atoi(optarg) ;
				break;
			case 'v': 
				verbose = 1;
				break;
			case 'f': 
				listname = optarg;
				break ;
			default:  
				usage();
				exit(-1);
		}
      }

	/* Check that a file was passed */
	if(listname != NULL) 
	{
		runFile(listname) ;
		return SUCCESS ;
	}
	/* else */
	usage() ;

	return SUCCESS ; 

} /* end of main() */ 

/** Print some usage information to stderr */ 
 void usage() 
{
    fprintf(stderr, "Usage:  %s [-v] [-n] -f file\n", prog_name);
    fprintf(stderr, "  -v Turn on verbose output\n");    
    fprintf(stderr, "  -n Set maximum number of devices to run\n");
    fprintf(stderr, "  -f run the ripper using a file containing a list of devices\n"); 
} /* end of usage() */ 

/** 
	Initalize the list of processes
*/
void initList()
{
    numChildren = 0;
    clist = (child_t *)malloc(sizeof(child_t));
    
	if(clist == NULL)
	{
		fprintf(stderr, "%s: Out of memory!\n", prog_name);
		exit(-1);
	}
	
    /*
		Start a linked list of children. The first entry has PID = -1
		to makr the beginning of the list.
    */
    
    clist->PID	= -1	;
    clist->next	= NULL	;
    last		= clist	;

}/* end initList */

/**
	Wait for all children to finish
*/
void waitForChildren()
{
    /* Wait for each child to finish by PID */
    last = clist->next;
    
	while(last)
	{
		if (verbose)  
		{
			printf("[%s] Waiting for PID %d (%s)\n", prog_name, last->PID, last->argv[0]);
		}
	
		waitpid(last->PID, NULL, 0);
		freePid(last->PID);

		last = last->next;
    }

}/* end waitForChildren */

/**
	Wait for one child in the list
*/
void waitForAChild	()
{
	int pid ;

	if(verbose)
	{
		printf("[%s] Waiting for Child\n", prog_name);
	}

	pid = wait(NULL) ;

	if(verbose)
	{
		printf("[%s] Wait Returned PID %d\n", prog_name, pid);
	}

	if(pid != -1)
	{
		freePid(pid) ; 
	}

	return ;
}/** end waiting for a child */

/**
	Frees a single child 
*/
void freePid(int pid)
{
	child_t *curr = clist->next ;
	child_t *prev = clist		;

	/** Loop over children and find it */
	while(curr != NULL)
	{
		printf("\t\t\t\tPID: %d\tDev: %s\n", curr->PID, curr->argv[1]) ;
		curr = curr->next ; 
	}

	curr = clist->next ;

	/** Loop over children and find it */
	while(curr != NULL)
	{
		/* Child Found */
		if(curr->PID == pid)
		{
			prev->next = curr->next ;
			freeChild(curr)			;
			numChildren--			;

			/* Removing last item */
			if(prev->next == NULL)
			{
				last = prev ;
			}

			break ;
		}

		prev = curr		  ;
		curr = curr->next ; 
	}

}/** Free a single child */

/**
	Free a single child node
*/
 void freeChild(child_t *child)
{
	if(verbose)
	{
			printf("[%s] Freeing PID %d (%s)\n", prog_name, child->PID, child->argv[1]);
	}

	free(child->argv);
	free(child) ;
}/* end freeChild */

/** 
	Executes a command
	If a child node is passed, then it will add the child to the list
	Otherwise, it will execute the command and block for the return

	returns whether the execution was successful or not
*/
 int executeCommand(char * device)
{
		child_t *new_child = newRip(device);

		/* Check Creation Was Successful */
		if (new_child == NULL)
		{
			return EXEC_ERROR ;
		}

		/** 
			Add the process to the list
			if non-blocking calls
		*/
		last->next = new_child ;
		last	   = new_child ;
		numChildren++; 

		/* Create a child process to execute the command */
		if ((new_child->PID = fork()) == 0)  
		{
			/* Execute the process in a child */
			execv(new_child->argv[0], new_child->argv);

			printf("[%s] PID %d, command \"%s\" failed!\n", prog_name, getpid(), new_child->argv[1]);
			return EXIT ;
		}

		/* The parent (the launcher) continues here */
		if(verbose)
		{
			printf("[%s] Launched PID %d (%s)\n", prog_name, new_child->PID, new_child->argv[1]);
		}
		
		return SUCCESS ;
}

/** 
	Create a data structure to hold the child processes
*/ 
child_t *newRip(char *device)
{ 
	child_t *child	; 

    /* Allocate a child_t data structure */
    child = (child_t*)malloc(sizeof(child_t));
    
	if(child == NULL)  
	{
		fprintf(stderr, "%s: Out of memory!\n", prog_name);
		return NULL;
    }

    child->next = NULL	;
    child->PID  = 0		;
	
	/* Malloc the arguments */
	child->argv = (char **)malloc(MAX_LINE_LEN * sizeof(char *));
	child->argc = 0 ;

    if(child->argv == NULL)
	{
		fprintf(stderr, "%s: Out of memory!\n", prog_name);
		free(child);
		return NULL;
    }

	/** Set arguments */
	child->argv[child->argc++] = rip_proc ;

	child->argv[child->argc] = (char *)malloc(MAX_LINE_LEN);
	memcpy(child->argv[child->argc++], device, MAX_LINE_LEN);
	
    return child; 

} /* end of newRip */
