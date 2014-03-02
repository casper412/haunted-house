import java.util.ArrayList;

/**
 * Generate a layout for a locker grid
 */
public class LockerLayout {
  /**
   * The locker to generate a layout for and hold final layout
   */
  private Locker locker;
  /**
   * Intermediate class to hold candidate solutions
   */
  public class LockerSolution {
    /**
     * The locker configuration of the solution
     */
    public Locker locker;
    /**
     * The packages that were not placed
     */
    public ArrayList<Package> leftovers;
  }
  /**
   * Build a layout engine for a grid
   * @param height is the height of the grid
   * @param width is the width of the grid
   */
  public LockerLayout(int height, int width) {
    this.locker = new Locker(height, width);
  }
  /**
   * Generate a layout for the provided packages storing 
   * the final layout in the layout engine
   * @param packages is the list of packages to place
   * @return the packages that could not be placed
   */
  public ArrayList<Package> generateLayout(ArrayList<Package> packages) {
    LockerSolution ls = generateLayout(locker, packages);
    if(ls != null) {
      this.locker = ls.locker;
      return ls.leftovers;
    } else {
      return packages; //none were placed
    }
  }
  /**
   * Internal method to place packages in temporary locker configurations
   * @param l is the locker to use
   * @param packages are the current packages that haven't been placed
   * @return the best layout given the locker and packages
   */
  private LockerSolution generateLayout(Locker l, ArrayList<Package> packages) {
    ArrayList<LockerSolution> best = new ArrayList<LockerSolution>();
    
    //End recursion when no more packages to place
    if(packages.size() == 0) {
      LockerSolution solved = new LockerSolution();
      solved.leftovers = new ArrayList<Package>();
      solved.locker = l;
      return solved;
    }
    ArrayList<Package> npackages = new ArrayList<Package>();
    npackages.addAll(packages);
    Package p = npackages.remove(0);
    LockerLocation loc = null;
    //Using the package
    while((loc = l.canPlace(loc, p)) != null) {
      Locker nlocker = l.place(loc, p);
      LockerSolution candidate = generateLayout(nlocker, npackages);
      //Candidate solution
      if(candidate.leftovers.size() == 0) {
        return candidate;
      } else {
        best.add(candidate);
      }
    }
    //Skip taking it
    LockerSolution candidate = generateLayout(l, npackages);
    //candidate solution without this package
    candidate.leftovers.add(p);
    best.add(candidate);
    
    //Select layout leaving fewest 
    LockerSolution min = null;
    for(LockerSolution solution : best) {
      if(min == null || 
          jointPriority(min.leftovers) > jointPriority(solution.leftovers)) {
        min = solution;
      }
    }
    return min;
  }
  /**
   * Compute the joint priority of a set of packages
   * This is to score a left over set of packages to determine 
   * if a locker configuration is better than another. This 
   * function could be enhanced to weight the number of packages
   * against the priority and would ultimately be driven by the 
   * business rules related to guaranteeing a shipment
   * @param ps is the set of packages to score
   * @return
   */
  private int jointPriority(ArrayList<Package> ps) {
    int ret = 0;
    for(Package p : ps) {
      ret += p.getPriority();
    }
    return ret;
  }
  /**
   * Method to print out the locker layout
   */
  public void print() {
    locker.print();
  }
  /**
   * Main entry point - because this is a somewhat toy example
   * there are presently no command line arguments
   * @param args
   */
  public static void main(String args[]) {
    ArrayList<Package> packages = new ArrayList<Package>();
    
    packages.add(new Package(8, PackageSize.Medium, 3));
    packages.add(new Package(1, PackageSize.Large, 3));
    packages.add(new Package(2, PackageSize.Large, 2));
    packages.add(new Package(3, PackageSize.Large, 3));
     
    packages.add(new Package(4, PackageSize.Small, 1));
    packages.add(new Package(5, PackageSize.Small, 2));
    packages.add(new Package(6, PackageSize.Small, 2));
    packages.add(new Package(7, PackageSize.Small, 1));
    
    LockerLayout layout = new LockerLayout(4,4);
    ArrayList<Package> leftover = layout.generateLayout(packages);
    if(leftover.size() > 0) {
      System.out.println("Left Overs:");
      for(Package p : leftover) {
        p.print();
      }
    }
    layout.print();
   }
}
