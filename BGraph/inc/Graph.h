#pragma once

class Graph {
public:
  enum vertex_position_t { vertex_position };
  typedef square_topology<>::point_type point;
  
  //Int Graph
  // Some layouts will not work unless edge weights are stored as a double
  typedef boost::property<boost::edge_weight_t, double> EdgeWeightProperty;
  typedef boost::adjacency_list<
    boost::vecS, // container used to represent the edge-list for each of the vertices
    boost::vecS, // container used to represent the vertex-list of the graph
    boost::directedS,
  
    // Start vertex properties
    boost::property<boost::vertex_name_t, int,
    boost::property<vertex_position_t,    point,
    boost::property<vertex_index_t,       int> > >,
    // End vertex properties
    EdgeWeightProperty
  > IntGraph;
  
  typedef boost::graph_traits<IntGraph>::vertex_descriptor IntGraphVertex;
  typedef boost::graph_traits<IntGraph>::edge_descriptor IntGraphEdge;
  typedef boost::unordered_map<int, IntGraphVertex> IntMap;
  typedef boost::property_map<IntGraph, boost::vertex_name_t>::type IntVertexMap;
  typedef boost::property_map<IntGraph, boost::edge_weight_t>::type IntEdgeWeightMap;
  
private:
  class NodeWriter {
  public:
    NodeWriter(const IntVertexMap &map) : mMap(map) {}
    void operator() (std::ostream& o, const IntGraphVertex& v) const;
    
  private:
    const IntVertexMap &mMap;
  };
  
  class EdgeWriter {
  public:
    EdgeWriter(const IntEdgeWeightMap &m) : mMap(m) {}
    void operator() (std::ostream& o, const IntGraphEdge& e) const;
    
  private:
    const IntEdgeWeightMap &mMap;
  };
  
public:
  Graph();
  void addEdge(int x, int y);
  IntGraphVertex addNode(int n);
  void print();
  
private:
  IntGraph graph;
  IntVertexMap vertMap;
  IntEdgeWeightMap edgeWeightMap;
  IntMap dataMap;
  
};