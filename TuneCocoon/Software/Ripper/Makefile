# Main supported targets:
#
# make, make all
#       Bring Code up-to-date
#
# make clean
#       Clean
#
# make distrib
#       Store tar file containing everything in ../
#
INCLUDES=
CPPFLAGS=-g -c -Wall -pedantic 
CXX=g++
LIBS=-lstdc++
LDFLAGS=

PROJECT=1
VERSION=0.1.1
APPNAME=diskRip

OBJ=batch.o diskRip.o
HDR=$(OBJ:.o=.h)
SRC=$(OBJ:.o=.C)

ALLDEP=$(HDR) Makefile

PROGRAMS=$(APPNAME)

default: all

all: $(APPNAME) 

$(APPNAME):	$(OBJ)
	$(CXX) $(LDFLAGS) -o $(APPNAME) $(OBJ)

%.o:	${SRC} $(ALLDEP)
	$(CXX) -c $(CPPFLAGS) $< -o $@ 

clean:
	rm -f *~ core *.log *.o

distrib: clean
	rm -f ${APPNAME}
	rm -f core
	rm -f ../${APPNAME}*.tar.gz
	tar cvzf ../${APPNAME}.tar.gz .

