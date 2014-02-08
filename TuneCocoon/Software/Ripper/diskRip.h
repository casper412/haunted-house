
/**
	Main Header File for Disk Ripper

	Matthew Hall
	February 2005
*/

/** Defintions  */
/*  Error Codes */
#define SUCCESS				0
#define EXEC_ERROR			1
#define EXIT				5

/** Some constants */ 
#define MAX_LINE_LEN (1024) 
#define TOKENSEPARATOR ",\t\r\n " 

/** A data structure to keep track of our children */ 
typedef struct child_t 
{
    pid_t	PID				;
    struct	child_t *next	;
	int		argc			;
	char	**argv			;
} child_t; 

/** Function prototypes */ 
void		usage		() ; 

/** Command Processing */
int		executeCommand(char *device) ;
child_t *newRip(char *device) ; 

/** List Processing */
void initList		() ;
void waitForChildren() ;
void waitForAChild	() ;
void freePid		(int pid) ;
void freeChild		(child_t *child_t) ;

/** Global Program Information */
int		max_procs		;
char	*prog_name		;
char	*rip_proc		;
int		 verbose		;

/** List of open processes */
child_t *clist					; 
child_t *last					;
int		numChildren				; 


