class Bullet {
    constructor(id,x,y,rate) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.rate = rate;
      this.dist = 0;
      this.range = 200;
      this.shape = null;
      this.addToLayer(towerLayer);
    }
  
    update(progress) {
      var move_dist = this.rate / 1000 * progress;
      this.dist = this.dist + move_dist;
      this.x = this.x + move_dist;
      this.y = this.y;
      this.shape.x(this.x);
      this.shape.y(this.y);

      if (this.dist > this.range) {
        this.kill();
      }
    }
  
    addToLayer(layer) {
      var width = 5;
      var height = 5;
      var widthOffset = width / 2.;
      var heightOffset = height / 2.;
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

