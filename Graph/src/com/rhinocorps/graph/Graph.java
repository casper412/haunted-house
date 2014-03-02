package com.rhinocorps.graph;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.Random;


public class Graph {
  /**
   * Inner class to store an edge with weight
   *
   */
  private class Edge {
    /** Start */
    int u;
    /** Destination */
    int v;
    /** Weight of edge */
    int w;
    /** Full constructor */
    public Edge(int u, int v, int w) {
      this.u = u;
      this.v = v;
      this.w = w;
    }
  }
  /**
   * Random number generator
   *
   */
  private static Random RAND = new Random();
  /**
   * All the edges
   */
  private Hashtable<Integer, ArrayList<Edge> > edgeList =
      new Hashtable<Integer, ArrayList<Edge> >();
  /**
   * All of the distances
   */
  private Hashtable<Integer, Integer> dist =
      new Hashtable<Integer, Integer>();
  /**
   * The start vertex
   */
  private int source = 0;
  /**
   * Main entry point
   * @param args
   */
  public static void main(String []args) {
    Graph g = Graph.randomGraph(2000);
    g.printGraphviz("output.txt");
    
    g.solve(g.randomNode());
    g.printGraphviz("output2.txt");
    
  }
  /**
   * Solve for single source shortest path
   * @param source is the start node
   */
  private void solve(int source) {
    int n = edgeList.size();
    //Init
    for(int i = 0; i < n; i++) {
      dist.put(i, Integer.MAX_VALUE);
    }
    dist.put(source, 0);
    this.source = source;
    //Solve
    Queue<Integer> bag = new LinkedList<Integer>();
    bag.add(source);
    while(bag.size() > 0) {
      int u = bag.poll();
      ArrayList<Edge> edges = edgeList.get(u);
      for(Edge edge : edges) {
        int distu = dist.get(edge.u);
        int distv = dist.get(edge.v);
        int nd = distu + edge.w;
        if(nd < distv) { //Edge is "tense"
          dist.put(edge.v, nd); //Relax edge
          bag.add(edge.v);
        }
      }
    }
  }
  /**
   * 
   * @return a random node
   */
  private int randomNode() {
    //This assumes the nodes are consecutively numbered
    return RAND.nextInt(edgeList.size());
  }
  /**
   * Write the graph to disk
   * @param file
   */
  private void printGraphviz(String file) {
    try {
      BufferedWriter bw = new BufferedWriter(new FileWriter(file));
      bw.write("digraph G { \n");
      //Print nodes
      for(Map.Entry<Integer, Integer> entry : dist.entrySet()) {
        int n = entry.getKey();
        int d = entry.getValue();
        String color = "black";
        if(n == source) {
          color = "red";
        }
        bw.write(n + " [label = \"node: " + n + " dist: " + d + "\" color=" + color + "];\n");
      }
      //Print edges
      for(Map.Entry<Integer, ArrayList<Edge>> entry : edgeList.entrySet()) {
        ArrayList<Edge> list = entry.getValue();
        for(Edge e : list) {
          bw.write(e.u + " -> " + e.v + " [label = " + e.w + "]\n");
        }
      }
      bw.write("}\n");
      bw.close();
    } catch(Exception e) {
      throw new RuntimeException("Output failure", e);
    }
  }
  /**
   * Add an edge to the graph
   * @param i
   * @param r
   * @param w
   */
  private void addEdge(int i, int r, int w) {
    Edge e = new Edge(i, r, w);
    ArrayList<Edge> list = edgeList.get(i);
    if(list == null) {
      list = new ArrayList<Edge>();
      edgeList.put(i, list);
    }
    list.add(e);
  }
  /**
   * Return true if an edge exists
   * @param i
   * @param r
   * @return
   */
  private boolean hasEdge(int i, int r) {
    ArrayList<Edge> list = edgeList.get(i);
    boolean ret = false;
    if(list != null) {
      for(Edge edge : list) {
        if(edge.u == i && edge.v == r) {
          ret = true;
          break;
        }
      }
    }
    return ret;
  }
  /**
   * Build a random graph
   * @param n
   * @return
   */
  private static Graph randomGraph(int n) {
    Graph g = new Graph();
    for(int i = 0; i < n; ++i) {
      int rc = Math.max(1, RAND.nextInt(20)); //1 - 4 connections
      for(int j = 0; j < rc; j++) {
        int r = RAND.nextInt(n);
        int w = RAND.nextInt(50);
        if(i != r) {
          if(!g.hasEdge(i, r)) {
            g.addEdge(i, r, w);
            g.addEdge(r, i, w);
          }
        }
      }
    }
    return g;
  }
  
}
