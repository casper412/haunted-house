class Bullet {
    constructor(id, location, direction, rate, range) {
      this.id = id;
      this.loc = location;
      this.dir = direction;
      this.rate = rate;
      this.dist = 0;
      this.range = range;
      this.shape = null;
      this.addToLayer(towerLayer);
    }
  
    update(progress) {
      var move_dist = this.rate * progress;
      this.dist = this.dist + move_dist;
      this.loc.x += this.dir.x * move_dist;
      this.loc.y += this.dir.y * move_dist;
      this.shape.x(this.loc.x);
      this.shape.y(this.loc.y);

      if (this.dist > this.range ||
        game.isOffBoard(this.loc.x, this.loc.y)) {
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
        x: this.loc.x - widthOffset,
        y: this.loc.y - heightOffset,
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

