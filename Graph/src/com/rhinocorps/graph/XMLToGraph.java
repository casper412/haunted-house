package com.rhinocorps.graph;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.NumberFormat;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class XMLToGraph {
  
  private static final String ATRB_NAME = "atrb_name";
  private static final String INTEGER = "new_ntgr_val";
  private static final String FLOAT = "new_real_val";
  
  private static final String NODE = "trackerNode";
  private static final String DIST = "trackerNodeDist";
  private static final String PRED = "trackerNodePred";
  
  private static final String EDGE_START = "trackerEdgeStart";
  private static final String EDGE_END = "trackerEdgeEnd";
  private static final String EDGE_WEIGHT = "trackerEdgeWeight";
  
  private BufferedWriter writer;
  
  enum State {
    NODE,
    EDGE
  }
  private State state = State.NODE;
  
  public XMLToGraph() {
    
  }
  
  public void parse() throws IOException {
    writer = new BufferedWriter(new FileWriter("test.gv"));
    writer.write("digraph G {\n");
    String node = "null";
    String dist = "null";
    
    String edgeStart = "null";
    String edgeEnd = "null";
    String weight = "null";
    
    //get the factory
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    try {
      //Using factory get an instance of document builder
      DocumentBuilder db = dbf.newDocumentBuilder();
      Document dom = db.parse("test.xml");
      
      //Find the occurrences
      NodeList list = dom.getElementsByTagName("occurrence");
      for(int i = 0; i < list.getLength(); i++) {
        Node n = list.item(i);
        String v = getAtrbName(n);
        
        //Start looking for Node stuff
        if(v.equals(NODE)) {
          state = State.NODE;
        }
        
        if(state == State.NODE) {
          if(v.equals(NODE)) {
            node = getInteger(n);
          } else if(v.equals(DIST)) {
            dist = getFloat(n);
            writer.write(node + " [label=\"" + node + " - " + dist + "\"];\n"); 
            state = State.EDGE;
          }
        } else if(state == State.EDGE) {
          if(v.equals(EDGE_START)) {
            edgeStart = getInteger(n);
          } else if(v.equals(EDGE_END)) {
            edgeEnd = getInteger(n);
          } else if(v.equals(EDGE_WEIGHT)) {
            weight = getFloat(n);
            writer.write(edgeStart + " -> " + edgeEnd + " [label=\"" + weight + "\"];\n");
          }
        }
      }
    } catch(Throwable t) {
      t.printStackTrace();
    }
    
    writer.write("}\n");
    writer.close();
  }
  
  
  private String getAtrbName(Node n) {
    return getValue(n, ATRB_NAME);
  }
  
  private String getInteger(Node n) {
    return getValue(n, INTEGER);
  }
  
  private String getFloat(Node n) {
    String f = getValue(n, FLOAT);
    float f2 = Float.parseFloat(f);
    NumberFormat format = new DecimalFormat("0.000");
    return format.format(f2);
  }
  
  private String getValue(Node n, String name) {
    NodeList values = n.getChildNodes();
    for(int j = 0; j < values.getLength(); j++) {
      Node value = values.item(j);
      if(value.getNodeName().equals(name)) {
        return value.getFirstChild().getNodeValue().trim();
      }
    }
    return null;
  }

  public static void main(String []args) {
    XMLToGraph graph = new XMLToGraph();
    try {
      graph.parse();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
