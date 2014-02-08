/*
	Matthew Hall
	Encoder
	Tune Coccon LLC.
	February 2005

	Header for directory manager object
*/

#ifndef DIRECTORY_MJH_0412
#define DIRECTORY_MJH_0412

#include <string>
#include <list>
#include <vector>
#include <semaphore.h>
#include <unistd.h>
#include <sys/types.h>
#include <signal.h>
#include <fcntl.h>
#include <dirent.h>

using namespace std ; 

typedef list<int>				track_queue ;
typedef pair<string, string>	trk_entry	;

class Directory
{
public:
	//Build a directory with a base path, an output path, and a name
	Directory(string in_path, string out_path, string dir_name) ;
	
	~Directory() ;

	//Creation of file in directory
	void rescanDir(bool scan) ;

	//Report if scanning is needed
	bool needScan() ;	

	//Rescan the directory for new wavs
	void doScan() ;

	//Flag that a track is finished
	void trackFinished(int trk) ;

	//Logging methods
	void log  (string msg) ; 
	void debug(string msg) ; 

	//Get the command to encode
	bool populateCommand(int track, char **argv, int args, int max_length) ;

protected:

	//Handle file creation signals
	void setupNotification() ;

	//Scanning Functions
	void buildTrackQueue() ;
	
	//Send tracks off for processing
	void queueTracks() ;

	//Check for special text files
	void processSpecialFiles(string file) ;

	//Parse the text files
	bool parseTOC(string toc) ;
	bool parseEXT(string ext) ;

	void parseTrack(trk_entry &trk, string line) ;

	//Ensure syncronization on this structure
	void lock()			;
	void unlock()		;

protected:
	string	in_path		;
	string	out_path	;
	string	dir_name	;

	int			fd		; //File Descriptor For CD Files
	DIR			*dir	; //DIR* for reading the directory

	bool		scan	; //Flag if rescan is needed

	track_queue tracks_todo			;
	track_queue	tracks_processing	;

	sem_t		sync				;

	bool		isDone				;
	bool		toc_processed		;
	bool		ext_processed		;

	//CD Extended Information
	string disc_id	;
	string artist	;
	string title	;
	string artist_full_name ;
	string sort_title		;
	string year			;
	string record_label	;
	string compilation	;
	string genre_1		;
	string genre_2		;
	string disk_of		;
	string credits		;
	string region		;
	string language		;
	string revision		;
	string certifier	;
	string total_time	;

	//CD TOC
	trk_entry		tracks[50];
} ;

#endif 

