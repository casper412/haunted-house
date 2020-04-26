class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.length = null;
    }

    add(p2) {
      return new Point(this.x + p2.x, this.y + p2.y);
    }

    minus(p2) {
      return new Point(this.x - p2.x, this.y - p2.y);
    }

    times(scalar) {
      return new Point(this.x * scalar, this.y * scalar);
    }

    copy() {
      return new Point(this.x, this.y);
    }

    getLength() {
      if (!this.length) {
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);        
      }
      return this.length;
    }
}
