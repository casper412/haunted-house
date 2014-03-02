/**
 * Bean to represent the size of the package
 * with an enumeration for three common sizes of packages
 */
public class PackageSize {
  public static PackageSize Large = new PackageSize(2,2);
  public static PackageSize Medium = new PackageSize(1,2);
  public static PackageSize Small = new PackageSize(1,1);
  
  private int height;
  private int width;
  
  public PackageSize(int height, int width) {
    this.height = height;
    this.width = width;
  }

  public int getHeight() {
    return height;
  }

  public int getWidth() {
    return width;
  }

  @Override
  public String toString() {
    return "PackageSize [height=" + height + ", width=" + width + "]";
  }
 
}
