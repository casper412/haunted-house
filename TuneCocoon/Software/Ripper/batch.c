/**
	Main File for all batch processing 
	for Casper Shell

	Matthew Hall
	February 2005
*/

#include	<stdio.h> 
#include	<stdlib.h> 
#include	<unistd.h> 
#include	<string.h> 
#include	<errno.h> 
#include	<sys/wait.h> 

#include "diskRip.h"
#include "batch.h"

/** Function runs the shell in batch mode */
 void runFile(char * listname)
{
	FILE	*fp			;

    /* Try to open the listfile for reading */
    fp = fopen(listname, "r");
    
	if(fp == NULL)  
	{
		fprintf(stderr, "%s: Cannot open file \"%s\"! (%s)\n", prog_name,
	    listname, strerror(errno));
		exit(-1);
    }

    if(verbose)
	{
		printf("[%s] Successfully opened file \"%s\"\n", prog_name, listname);
    }

    /* Process the list file one line at a time */
    processFile(fp);
    fclose(fp);

}/** end runFile */

/** Read the file line by line and execute each command */ 
 void processFile(FILE *fp) 
{
	char	device[MAX_LINE_LEN]	; 
    int		ret						;	
	int		line_count	= 0			;

	initList() ;

	/* Loop over the file */
    while(fgets(device, MAX_LINE_LEN, fp) != NULL)
	{
		line_count++ ;

		if(verbose)  
		{
			printf("[%s] Device: \"%s\"\n", prog_name, device);
		}
	
		/** Execute the line in the file and tack it on the process list */
		ret = executeCommand(device) ;

		if(ret == EXEC_ERROR)
		{
			if(verbose)
			{
				printf("[%s] executeCommand() of line %d failed\n", prog_name, line_count);
			}
		}
		else if(ret == EXIT)
		{
			/* Exit this thread */
			return ;
		}

		/* Check if we have too many processes */
		while(numChildren >= max_procs)
		{
			printf("\t\t\t%d\n", numChildren) ;
			waitForAChild() ;
		}
	}
    
	/* Exit application */
	waitForChildren() ;

} /* end of process_file() */ 




