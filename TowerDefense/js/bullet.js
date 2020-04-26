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
      var radius = 2;
      this.shape = new Konva.Circle({
        x: this.loc.x,
        y: this.loc.y,
        radius: radius,
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

