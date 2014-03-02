/**
 * A 2D grid of lockers
 */
public class Locker {
  /**
   * Height of the grid
   */
  private int height;
  /**
   * Width of the grid
   */
  private int width;
  /**
   * The 2d array of cubbies
   */
  Cubby[][] cubbies = null;
  /**
   * Internal class to represent the cubby
   *
   */
  private class Cubby {
    Package pkg;
    
    public Cubby() {
      
    }
  }
  
  /**
   * Build a 2d locker configuration
   * @param height is the height of the grid
   * @param width is the width of the grid
   */
  public Locker(int height, int width) {
    this.height = height;
    this.width = width;
    this.cubbies = new Cubby[width][height];
    
    for(int j = 0; j < height; j++) {
      for(int i = 0; i < width; i++) {
        cubbies[i][j] = new Cubby();
      }
    }
  }
  /**
   * Deep Copy a locker
   * This is used as we build up new candidate layouts
   * 
   * @param locker is the source
   */
  public Locker(Locker locker) {
    this.height = locker.height;
    this.width = locker.width;
    this.cubbies = new Cubby[width][height];
    
    for(int j = 0; j < height; j++) {
      for(int i = 0; i < width; i++) {
        cubbies[i][j] = new Cubby();
        cubbies[i][j].pkg = locker.cubbies[i][j].pkg;
      }
    }
  }
  /**
   * Check is a package can be place after location
   * The search looks to right of the location and then up.
   * 
   * @param loc is the location to start the search from
   * @param p is the package to attempt to place
   * @return a non-null location if the package can be placed at 
   *  some location after the location provided.
   * 
   */
  public LockerLocation canPlace(LockerLocation loc, Package p) {
    int swidth = 0;
    int sheight = 0;
    
    if(loc != null) {
      swidth = loc.getX() + 1;
      sheight = loc.getY();
      if(swidth >= width) {
        swidth = 0;
        sheight++;
      }
    }
    for(int y = sheight; y < height; y++) {
      for(int x = swidth; x < width; x++) {
        if(fit(p.getSize(), x, y)) {
          return new LockerLocation(x, y);
        }
      }
    }
    return null;
  }
  /**
   * Place package at a given location and return a copy of the locker
   * with the package placed
   * @param loc is the location to place the package at
   * @param p is the package to place
   * @return a deep copy of the locker
   */
  public Locker place(LockerLocation loc, Package p) {
    int swidth = 0;
    int sheight = 0;
    
    if(loc != null) {
      swidth = loc.getX();
      sheight = loc.getY();
    }
    
    if(fit(p.getSize(), swidth, sheight)) {
      Locker ret = new Locker(this);
      int cy = 0;
      int cx = 0;
      for(int y = sheight; y < height && cy < p.getSize().getHeight(); y++, cy++) {
        cx = 0;
        for(int x = swidth; x < width && cx < p.getSize().getWidth(); x++, cx++) {
          ret.cubbies[x][y].pkg = p;
        }
      }
      return ret;
    }
    //Tried placing a package that wouldn't fit
    return null;
  }
  /**
   * Check is a package can fit at location x,y
   * 
   * TODO: This method could be moved into PackageSize
   * to handle other shapes of packages
   * 
   * @param s is the size of the package
   * @param tx is the x coordinate to start the check from
   * @param ty is the y coordinate to start the check from
   * @return true if all of the cubbies are empty for that range
   */
  public boolean fit(PackageSize s, int tx, int ty) {
    int cx = 0;
    int cy = 0;
    for(int y = ty; y < height && cy < s.getHeight(); y++, cy++) {
      cx = 0;
      for(int x = tx; x < width && cx < s.getWidth(); x++, cx++) {
        if(cubbies[x][y].pkg != null) {
          return false;
        }
      }
    }
    return cy == s.getHeight() && cx == s.getWidth();
  }
  /**
   * Generate a text string 2d representation
   */
  public String toString() {
    StringBuilder sb = new StringBuilder();
    for(int j = 0; j < height; j++) {
      for(int i = 0; i < width; i++) {
        sb.append(cubbies[i][j].pkg == null ? " " : cubbies[i][j].pkg.getId());
      }
      sb.append("\n");
      for(int i = 0; i < width; i++) {
        sb.append("-");
      }
      sb.append("\n");
    }
    return sb.toString();
  }
  /**
   * Helper method to emit to standard out
   */
  public void print() {
    System.out.println(toString());
  }
}
