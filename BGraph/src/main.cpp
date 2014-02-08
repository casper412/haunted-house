#include "main.h"
#include "Graph.h"

using namespace boost;
using namespace std;

int main(int argc, const char *argv[]) {
  //Load a file
  ifstream f("input/data.txt", std::ifstream::in);
  int u,v;
  Graph g;
  //Read int pairs as edge starts and end
  while(f.good()) {
    f >> u;
    //Hit end of file looking for another u
    if(!f.eof()) {
      f >> v;
      if(!f.eof()) {
        g.addEdge(u, v);
        //printf("%d -> %d\n", u ,v);
      }
    }
  }
  g.print();
  
  f.close();
  return 0;
}