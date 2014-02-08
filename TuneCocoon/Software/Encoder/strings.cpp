

#include <string>

using namespace std ;

#include "strings.h"

/*
	Trim leading and trailing whitespace
*/
string trim(string in_str)
{
	string str = in_str ;

	static string whitechars = " \t\n" ;

    //trim leading whitespace
    string::size_type  notwhite = str.find_first_not_of(whitechars);
    str.erase(0, notwhite);

    //trim trailing whitespace
    notwhite = str.find_last_not_of(whitechars); 
    str.erase(notwhite + 1); 

    return str ;
}

/*
	Convert the spaces to under scores
*/
string convert(string in_str)
{
	string str = in_str ;

	replace(str, ' ', "\\ ") ;

	return str ;
}

/*
	Replace a character
*/
void replace(string &in_str, char f, string r)
{
	string str = "" ;
	
	for(size_t i = 0 ; i < in_str.size() ; i++)
	{
		if(in_str[i] == f)
		{
			str += r ;
		}
		else
		{
			str += in_str[i] ;
		}
	}

	in_str = str ;
}


