/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	Implementation of a running process
*/

/*
	Build a running process
*/

#include "RunningProc.h" 
#include "clusterEncode.h"

RunningProc::RunningProc(int track, Directory *dir)
{
	this->track = track ; 
	this->dir	= dir	; 

	//Allocate the args
	for(int i = 0 ; i < 25 ; i++)
	{
		args[i] = new char[1024] ;
	}

	//Populate the args with the directory info
	if(!dir->populateCommand(track, args, 25, 1024))
	{
		log("Build execution command failed.") ;
	}
}
/*
	Free the running process
*/
RunningProc::~RunningProc()
{
	for(int i = 0 ; i < 25 ; i++)
	{
		delete [] args[i]  ;
	}
}

/*
	Notify process is done

	This process will kill the memory allocated for itself
*/
void RunningProc::finished()
{
	if(dir != NULL)
	{
		dir->trackFinished(track) ;
	}

	delete this ;
	return ;
}

/*
	Return arguments to fire it up
*/
char **RunningProc::getArgs()
{
	return args ;
}

/*
	Setter for pid
*/
void RunningProc::setPID(int pid)
{
	this->pid = pid ;
}
