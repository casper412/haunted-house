class Tower {
    constructor(id, location, firing_rate, rate, range) {
      this.id = id;
      this.loc = location;
      this.rate = rate;
      this.firing_rate = firing_rate;
      this.last_fire = 0;
      this.shape = null;
      this.range = range;
      this.addToLayer(towerLayer);
    }
  
    update(current_time, progress, collision) {

      // Select a ballon
      var balloon = collision.getFirstBalloon(this.loc, this.range);
      if (balloon) {
        // Decide if turning is needed
        // Decide to fire
        if (current_time - this.last_fire > this.firing_rate) {
          this.last_fire = current_time;
          var dir = balloon.loc.minus(this.loc);
          var mag = dir.getLength();
          var unit_dir = dir.times(1. / mag);
          game.addBullet(this.loc.copy(), unit_dir, this.rate, this.range);
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
        x: this.loc.x - widthOffset,
        y: this.loc.y - heightOffset,
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

class BasicTower extends Tower {
    constructor(id, location) {
      super(id, location, 1., 30., 200.);
    }
}

class AdvancedTower extends Tower {
  constructor(id, location) {
    super(id, location, 0.5, 50., 300.);
  }
}
