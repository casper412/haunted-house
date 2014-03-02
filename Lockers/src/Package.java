/**
 * Bean representing an individual package
 *
 */
public class Package implements Comparable<Package> {
  private int id;
  private PackageSize size;
  private int priority;

  public Package(int id, PackageSize size, int priority) {
    this.id = id;
    this.size = size;
    this.priority = priority;
  }

  public PackageSize getSize() {
    return size;
  }


  public void setSize(PackageSize size) {
    this.size = size;
  }


  public int getPriority() {
    return priority;
  }


  public void setPriority(int priority) {
    this.priority = priority;
  }


  public int getId() {
    return id;
  }

  @Override
  public String toString() {
    return "Package [id=" + id + ", size=" + size + ", priority=" + priority
        + "]";
  }

  public void print() {
    System.out.println(this.toString());
  }

  @Override
  public int compareTo(Package p) {
    return priority < p.priority ? -1 : priority == p.priority ? 0 : 1;
  }
}
