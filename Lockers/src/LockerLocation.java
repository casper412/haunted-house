/**
 * 
 * Light-weight bean to store an X,Y location in a locker grid
 *
 */
public class LockerLocation {

  private int x;
  private int y;
  
  public LockerLocation(int x, int y) {
    this.x = x;
    this.y = y;
  }

  public int getX() {
    return x;
  }

  public void setX(int x) {
    this.x = x;
  }

  public int getY() {
    return y;
  }

  public void setY(int y) {
    this.y = y;
  }

}
