/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	Header for a running process
*/

#ifndef RUNNINGPROC_MJH_0412
#define RUNNINGPROC_MJH_0412

#include "Directory.h"

class RunningProc
{
public:

	// Build a running process
	RunningProc(int track, Directory *dir) ;
	// Free the running process
	~RunningProc() ;

	//Notify the process is done
	void finished() ;

	//Change pid after creation
	void setPID(int pid)	;

	//Return arguments to execute process
	char **getArgs() ;

protected:

	int			pid		;
	int			track	;

	Directory	*dir	;

	char		*args[25] ;

};

#endif


