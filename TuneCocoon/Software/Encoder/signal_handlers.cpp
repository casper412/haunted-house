/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	All signal handlers
*/

//Function handles cd directory creation notifications
void directory_create(int sig, siginfo_t *spI, void *buf)
{
	//Process sub directory
	if(wav_fd != spI->si_fd)
	{
		processCDDir(spI->si_fd) ;
	}
	else
	{//Rescan cd root
		struct dirent *dirp ;
		rewinddir(wav_dir);

		while((dirp = readdir(wav_dir)))
		{
			string curr = dirp->d_name ;

			if(curr == "." || curr == "..")
				continue ;

			debug("Check directory: " + curr) ;

			sem_wait(&sem_map) ;
			
			dirmap::iterator i = cd_dirs.find(curr) ;
			
			//Not in map already
			if(i == cd_dirs.end())
			{
				cd_dirs[curr] = new Directory(wav_path, mp3_path, curr) ;
			}

			//TODO: Check for directories removed during processing 
			sem_post(&sem_map) ;
		}
	}
}

/*
	Lookup the directory we are watching and 
	notify it that a file was created
*/
void processCDDir(int fd)
{
	//Lock the sig list
	sem_wait(&sem_sig) ;
	
	sigmap::iterator s = cd_sigs.find(fd) ;
			
	//Not in map already
	if(s == cd_sigs.end())
	{
		debug("Handler not found for FD!!\n") ;
		return ;
	}

	string dirname = cd_sigs[fd] ; 

	//Unlock sig list
	sem_post(&sem_sig) ;

	//Lock the directory listing
	sem_wait(&sem_map) ;

	dirmap::iterator i = cd_dirs.find(dirname) ;
			
	//Not in map already
	if(i == cd_dirs.end())
	{
		debug("Directory not found for file handle") ;
		return ;
	}

	Directory * d = (*i).second ; 

	//Unlock the directory listing
	sem_post(&sem_map) ;

	d->rescanDir(true) ;
}

/*
	Register a signal handler for a directory
*/
bool registerHandler(string dir_name, int fd)
{
	sem_wait(&sem_sig) ;
	cd_sigs[fd] = dir_name ;
	sem_post(&sem_sig) ;

	fcntl(fd, F_SETSIG, SIGIO);
	fcntl(fd, F_NOTIFY, DN_CREATE | DN_MULTISHOT);

	return true ;
}

/*
	Remove a handler from the setup
*/
void removeHandler(int fd)
{
	sem_wait(&sem_sig) ;
	cd_sigs.erase(fd)  ;
	sem_post(&sem_sig) ;

	fcntl(fd, F_NOTIFY, 0);
}

