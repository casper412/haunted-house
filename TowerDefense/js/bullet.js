class Bullet {
    constructor(id, x, y, x_dir, y_dir, rate, range) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.x_dir = x_dir;
      this.y_dir = y_dir;
      this.rate = rate;
      this.dist = 0;
      this.range = range;
      this.shape = null;
      this.addToLayer(towerLayer);
    }
  
    update(progress) {
      var move_dist = this.rate * progress;
      this.dist = this.dist + move_dist;
      this.x += this.x_dir * move_dist;
      this.y += this.y_dir * move_dist;
      this.shape.x(this.x);
      this.shape.y(this.y);

      if (this.dist > this.range ||
        game.isOffBoard(this.x, this.y)) {
        this.kill();
        return false;
      }
      return true;
    }
  
    addToLayer(layer) {
      var width = 5;
      var height = 5;
      var widthOffset = width /2;
      var heightOffset = height /2;
      this.shape = new Konva.Rect({
        x: this.x - widthOffset,
        y: this.y - heightOffset,
        width: width,
        height: height,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 0.5
      });
      layer.add(this.shape);
    }

    kill() {
      this.shape.remove();
      game.removeBullet(this.id);
    }
  }

