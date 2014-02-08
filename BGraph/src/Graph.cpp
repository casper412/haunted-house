#include "main.h"
#include "Graph.h"

using std::string;
/*! \brief Build an empty graph
 */
Graph::Graph() {
  vertMap = get(vertex_name, graph);
  edgeWeightMap = get(edge_weight, graph);
}
/*! \brief Add an edge from u to v
 * \arg u is the name of the start of the edge
 * \arg v is the name of the end of the edge
 */
void Graph::addEdge(int u, int v) {
  //Make sure the nodes are in the graph
  IntGraphVertex uv, vv;
  IntMap::iterator ui = dataMap.find(u);
  if(ui == dataMap.end()) {
    uv = addNode(u);
  } else {
    uv = (*ui).second;
  }
  IntMap::iterator vi = dataMap.find(v);
  if(vi == dataMap.end()) {
    vv = addNode(v);
  } else {
    vv = (*vi).second;
  }
  
  boost::graph_traits<IntGraph>::edge_descriptor e;
  bool found;
  tie(e, found) = edge(uv, vv, graph);
  if(!found) {
    tie(e, found) = add_edge(uv, vv, graph);
    printf("%d/%d\n", u, v);
    edgeWeightMap[e] = 1.;
  }
}
/*! \brief Add a node to the graph with name n
 */
Graph::IntGraphVertex Graph::addNode(int n) {
  IntGraphVertex v = add_vertex(graph);
  dataMap[n] = v;
  vertMap[v] = n;
  return v;
}
/*! \brief Print the graph to a hardcoded file 
 */
void Graph::print() {
  //Write out the graphviz file
  printf("Writing graph\n");
  string out("graph.txt");
  std::ofstream o2(out.c_str());
  EdgeWriter edgeWriter(edgeWeightMap);
  NodeWriter nodeWriter(vertMap);
  write_graphviz(o2, graph, nodeWriter, edgeWriter);
  
  printf("starting dot\n");
  
  //Convert using graphviz
  string cmd;
  cmd = "dot \"";
  cmd += out + "\" -Tpdf > \"";
  cmd += out.substr(0, out.length() - 3);
  cmd += "pdf\"";
  printf("Executing cmd %s\n", cmd.c_str());
  system(cmd.c_str());
  
}

/*! \brief Method to write out one node
 */
void Graph::NodeWriter::operator() (std::ostream& o, const IntGraphVertex& v) const {
  int s(get(mMap, v));
  o << "[label=\"" << s << "\"]";
}

/*! \brief Method to write out one edge
 */
void Graph::EdgeWriter::operator() (std::ostream& o, const IntGraphEdge& e) const {
  int v(get(mMap, e));
  o << "[";
  o << "label=\"";
  o << v;
  o << "\"";
  o << "color=\"#";
  char m[2];
  sprintf(m, "%02x", std::min(255, v * 2));
  o << m << "0000";
  o << "\"]";
}
