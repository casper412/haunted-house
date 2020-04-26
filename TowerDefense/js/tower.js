class Tower {
    constructor(id, x, y, rate) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.rate = rate;
      this.firing_rate = 1.;
      this.last_fire = 0;
      this.shape = null;
      this.range = 200;
      this.addToLayer(towerLayer);
    }
  
    update(current_time, progress, collision) {

      // Select a ballon
      var balloon = collision.getFirstBalloon(this.x, this.y, this.range);
      if (balloon) {
        // Decide if turning is needed
        // Decide to fire
        if (current_time - this.last_fire > this.firing_rate) {
          this.last_fire = current_time;
          var x_dir = balloon.x - this.x;
          var y_dir = balloon.y - this.y;
          var mag = collision.getDistance(0, 0, x_dir, y_dir);
          x_dir /= mag;
          y_dir /= mag;
          game.addBullet(this.x, this.y, x_dir, y_dir, this.rate, this.range);
        }
      }
    }
  
    addToLayer(layer) {
      var width = 50;
      var height = 56;
      var widthOffset = width / 2.;
      var heightOffset = height / 2.;
      /*this.shape = new Konva.Rect({
        x: this.x - widthOffset,
        y: this.y - heightOffset,
        width: width,
        height: height,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 0.5
      });*/
      var imageObj = new Image();
      var animations = {
        idle: [
                0, 0, 50, 56,
               49, 0, 50, 56
              ]
      };
      this.shape = new Konva.Sprite({
        x: this.x - widthOffset,
        y: this.y - heightOffset,
        image: imageObj,
        animation: 'idle',
        animations: animations,
        frameRate: 2,
        frameIndex: 0
      });
      this.shape.start();
      layer.add(this.shape);
      imageObj.src = './assets/generic-sprite.jpg';
    }
  
    
  }

