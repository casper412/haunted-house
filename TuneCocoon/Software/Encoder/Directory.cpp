/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	Implementation for directory manager object
*/

#include "Directory.h"
#include "clusterEncode.h"
#include "strings.h"

#include <algorithm>

#define MAX_INT	36537 

extern bool		verbose ;

extern sem_t	sem_map ;
extern sem_t	sem_que	;

extern proc_que enc_que ;
extern dirmap	cd_dirs ;

/*
	Build a new directory object
*/
Directory::Directory(string in_path, string out_path, string dir_name)
{
	this->in_path  = in_path  ;
	this->out_path = out_path ;
	this->dir_name = dir_name ;

	rescanDir(true)  ;

	isDone		  = false ;
	toc_processed = false ;
	ext_processed = false ;

	setupNotification() ;

	debug("Created") ;

	sem_init(&sync, 0, 1);
}

/*
	Cleanup handles and memory
*/
Directory::~Directory()
{
	debug("Freed") ;
	close(fd) ;
	removeHandler(fd) ;

	sem_destroy(&sync) ;
}

/*
	Opens the handles to allow the system to notify 
	when a file is created
*/
void Directory::setupNotification()
{
	//Setup directory handler
    dir = opendir(string(in_path + "/" + dir_name).c_str());
    fd  = dirfd(dir) ;

	debug("Setting up signals") ;

	//Setup signals
	registerHandler(dir_name, fd) ;
}

/*
	Set if rescan is needed
*/
void Directory::rescanDir(bool scan) 
{
	debug("Setting reScan") ;
	this->scan = scan ;
}

/*
	Report if scanning is needed
*/
bool Directory::needScan()
{
	return scan ;
}

/*
	Main function which rescans the directory
	it references

	it will add jobs to the queue if possible
	or optionally delete the directory if 
	the done.txt is present
*/
void Directory::doScan()
{
	rescanDir(false) ;

	debug("Scanning") ;

	lock(); 

	buildTrackQueue() ;

	queueTracks() ;

	unlock() ;
}

/*
	Takes any wavs in the directory
	and adds them to the internal todo
*/
void Directory::buildTrackQueue()
{
	struct dirent *dirp ;
	rewinddir(dir);

	while((dirp = readdir(dir)))
	{
		string curr = dirp->d_name ;

		if(curr == "." || curr == "..")
			continue ;

		debug("Processing: " + curr) ;

		//Strip it down
		size_t pos = curr.find(".wav", 0) ;
		
		if(pos < curr.size())
		{
			curr.erase(pos, 4) ;
			debug("Track Number Found: " + curr) ; 
		}
		else
		{
			//Check for one of the special files
			pos = curr.find(".txt", 0) ;
			if(pos < curr.size())
			{
				processSpecialFiles(curr) ; 
			}
			
			//Skip non-wave files
			continue ;
		}

		int track = atoi(curr.c_str()) ;

		if(track == 0)
		{
			log("Invalid Wave File Found") ;
		}

		track_queue::iterator t = find(tracks_todo.begin(), tracks_todo.end(), track) ;
		track_queue::iterator p = find(tracks_processing.begin(), tracks_processing.end(), track) ;

		//File has not been identified
		if(t == tracks_todo.end() && p == tracks_processing.end())
		{
			debug("Add Track: " + curr) ;
			tracks_todo.push_back(track) ;
		}
		//else skip

	}
}

/*
	If there are tracks in todo, send them to be processed
*/
void Directory::queueTracks() 
{
	//Can only have one track todo
	while(tracks_todo.size() > 1 || (isDone && tracks_todo.size() > 0))
	{
		sem_wait(&sem_que) ;

		int trk = tracks_todo.front()	;
		tracks_todo.pop_front() ;

		proc_item pi	 ;
		pi.first  = trk  ;
		pi.second = this ;

		enc_que.push(pi) ;

		tracks_processing.push_back(trk) ;

		char buff[10] ;
		sprintf(buff, "%d", trk) ;
		log("Moved " + string(buff) + " to processing.") ;

		sem_post(&sem_que) ;
	}

	return ;
}

/*
	Build the actual command to run
*/
bool Directory::populateCommand(int track, char **argv, int args, int max_length) 
{
	if(args < 10)
	{
		return false ;
	}

	char *buff = new char[max_length * 2] ;

	string track_title = tracks[track].second ;

	sprintf(buff, "%d", track) ;

	track_title = convert(track_title) ;
	artist		= convert(artist) ;
	title		= convert(title) ;
	year		= convert(year) ;
	genre_1		= convert(genre_1) ;

	strncpy(argv[0], "./encode_lame",		 max_length) ;
	strncpy(argv[1], track_title.c_str(),    max_length) ;
	strncpy(argv[2], artist.c_str(),		 max_length) ;
	strncpy(argv[3], title.c_str(),			 max_length) ;
	strncpy(argv[4], year.c_str(),			 max_length) ;
	strncpy(argv[5], buff,					 max_length) ;
	strncpy(argv[6], genre_1.c_str(),		 max_length) ;

	//Build in file
	sprintf(buff, "%02d.wav", track) ;
	string in_file = in_path + "/" + dir_name + "/" + buff;
	strncpy(argv[7], in_file.c_str(),		max_length) ;

	//Convert output strings
	string cartist = convert(artist) ;
	string calbum  = convert(title)  ;
	string ctrack_title = convert(track_title) ;

	//Build out path
	string op = out_path + "/" + cartist + "/" + calbum ;
	strncpy(argv[8], op.c_str(),			max_length) ;
	
	//build outfile
	sprintf(buff, "%02d-%s.mp3", track, ctrack_title.c_str()) ;
	strncpy(argv[9], buff,		max_length) ;

	delete buff ;

	return true ;
}

/*
	Signal track is finished processing
*/
void Directory::trackFinished(int trk)
{
	lock()	 ;
	
	char buff[10] ;
	sprintf(buff, "%d", trk) ;
	log("Track " + string(buff) + " finshed processing.") ;

	track_queue::iterator t = find(tracks_processing.begin(), tracks_processing.end(), trk) ;

	//Processing track found
	if(t != tracks_processing.end())
	{
		tracks_processing.erase(t) ;

		//Directory done and ready to be destoryed
		if(isDone && tracks_processing.size() == 0 && tracks_todo.size() == 0)
		{
			//TODO: Remove directory from disk

			//Remove from list
			sem_wait(&sem_map) ;
			dirmap::iterator i = cd_dirs.find(dir_name) ;
			
			if(i != cd_dirs.end())
			{
				cd_dirs.erase(i) ;
			}
			else
			{
				log("Critical Error: Not in list of directories") ;
			}
			sem_post(&sem_map) ;

			delete this ;
			return ;
		}
	}
	else
	{
		log("Critical Error: Processing Track Not Found.") ;
	}

	unlock() ;

	return ;
}

/*
	Take the regular text files and 
	bring them into data structures
*/
void Directory::processSpecialFiles(string file)
{
	static string toc  = "toc.txt"		;
	static string ext  = "extinfo.txt"  ;
	static string done = "done.txt"		;

	//Check that the ripping is done
	if(!isDone && file == done)
	{
		isDone = true ;
		return ;
	}
	else if(!toc_processed && file == toc)
	{
		toc_processed = parseTOC(toc) ;
	}
	else if(!ext_processed && file == ext)
	{
		ext_processed = parseEXT(ext) ;
	}
}

/*
	Load TOC
*/
bool Directory::parseTOC(string toc)
{	
	FILE	*fp			;
	char	line[1024]  ;
	size_t	pos			;
	
	bool	tracks_started = false ;
	int		trk			;

	trk_entry	tmp		;

    /* Try to open the listfile for reading */
    fp = fopen(string(in_path + "/" + dir_name + "/" + toc).c_str(), "r");
    
	if(fp == NULL)  
	{
		log("Cannot open file " + toc + "\n");
		return false ;
    }

    /* Process the list file one line at a time */
    while(fgets(line, 1024, fp) != NULL)
	{
		string str = trim(line) ;

		if(str.find("01") < str.size())
		{//Tracks started
			tracks_started = true ;
			trk = 1 ;

			parseTrack(tmp, str) ;
			tracks[1] = tmp ;
		}
		else if(tracks_started)
		{
			pos = str.find("Total Time:") ;
			if(pos < str.size())
			{
				str.erase(0, pos + 1)  ;
				total_time = trim(str) ;
			}
			else
			{
				parseTrack(tmp, str) ;
				tracks[++trk] = tmp ;
			}
		}
		//else
		//continue

		//TODO: Change array to vector
		if(trk > 49)
		{
			log("Fatal Error: More than 50 tracks on disk.") ;
			break ;
		}
	}

	return true ;
}

/*
	Load Extra Info
*/
bool Directory::parseEXT(string ext)
{
/* 
Sample File
------- Album Information -------
Xmcd disc ID: f10cf212
Artist: Everlast
Title: Whitey Ford Sings The Blues
Artist full name:
Sort title:
Year: 1999
Record label: Tommy Boy
Compilation: No
Genre 1: Hip Hop/Rap -> General Hip Hop
Genre 2: Rock -> Hard Rock
Disc 1 of 1
Credits:
Region:
Language: English
Revision: 118
Certifier: Gracenote */
	
	FILE	*fp			;
	char	line[1024]  ;
	size_t	pos			;
	size_t	dpos		;

    /* Try to open the listfile for reading */
    fp = fopen(string(in_path + "/" + dir_name + "/" + ext).c_str(), "r");
    
	if(fp == NULL)  
	{
		log("Cannot open file " + ext + "\n");
		return false ;
    }

    /* Process the list file one line at a time */
    while(fgets(line, 1024, fp) != NULL)
	{
		string key	 = line ;
		string value = line ;

		pos = key.find(":", 0) ;

		//Skip lines without colons
		if((dpos = key.find("Disk")) <= key.size())
		{
			disk_of = trim(value) ;
		}
		else if(pos < key.size())
		{
			//Remove after the pos
			key.erase  (pos) ;
			value.erase(0, pos + 1) ;

			value = trim(value) ;
			key   = trim(key)   ;

			//Check for the Key
			if(key == "Xmcd disc ID")
			{
				disc_id = value ;
			}
			else if(key == "Artist")
			{
				artist = value ;
			}
			else if(key == "Title")
			{
				title = value ;
			}
			else if(key == "Artist full name")
			{
				artist_full_name = value ;
			}
			else if(key == "Sort title")
			{
				sort_title = value ;
			}
			else if(key == "Year")
			{
				year = value ;
			}
			else if(key == "Record label")
			{
				record_label = value ;
			}
			else if(key == "Compilation")
			{
				compilation = value ;
			}
			else if(key == "Genre 1")
			{
				genre_1 = value ;
			}
			else if(key == "Genre 2")
			{
				genre_2 = value ;
			}
			else if(key == "Credits")
			{
				credits = value ;
			}
			else if(key == "Region")
			{
				region = value ;
			}
			else if(key == "Language")
			{
				language = value ;
			}
			else if(key == "Revision")
			{
				revision = value ;
			}
			else if(key == "Certifier")
			{
				certifier = value ;
			}
		}
		//else continue
	}

    fclose(fp);

	return true ; 
}

/*
	Parse a single track entry
*/
void Directory::parseTrack(trk_entry &trk, string line)
{
	size_t		pos = line.find(" ") ;
	
	//Remove Track
	line.erase(0, pos + 1) ;

	//Get Time
	pos = line.find(" ") ;
	trk.first = trim(line.substr(0, pos)) ;

	//Remove Time
	line.erase(0, pos + 1);

	//Get Title
	trk.second = trim(line) ;

	return ;
}

/*
	Locks relevant poritions of this class
*/
void Directory::lock()
{
	sem_wait(&sync); 
}

/*
	Unlocks relevant poritions of this class
*/
void Directory::unlock()	
{
	sem_post(&sync) ;
}

/*
	Log normal info messages
*/
void Directory::log  (string msg)
{
	::log(dir_name + ":\t" + msg) ;
}

/*
	Log debug information
*/
void Directory::debug(string msg)
{
	if(verbose == true)
	{
		this->log(msg) ;
	}
}


