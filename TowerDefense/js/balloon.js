
class Balloon {
    constructor(id, rate, color) {
      this.id = id;
      this.loc = new Point(0, 0);
      this.rate = rate;
      this.color = color;
      this.pathDistance = 0;
      this.shape = null;
      this.radius = 5;
      this.addToLayer(balloonLayer);
    }
  
    update(progress) {
      this.pathDistance = this.pathDistance + progress * this.rate;
      var pos = game.path.getLocation(this.pathDistance);
  
      if (pos == null) {
        this.kill();
        return false;
      } else {
        this.loc = pos;
        this.shape.x(this.loc.x);
        this.shape.y(this.loc.y);
      }
      return true;
    }
  
    addToLayer(layer) {
      this.shape = new Konva.Circle({
        x: this.loc.x,
        y: this.loc.y,
        radius: this.radius,
        fill: this.color,
        stroke: 'black',
        strokeWidth: 0.5
      });
      layer.add(this.shape);
    }
  
    kill() {
      this.shape.remove();
      game.removeBalloon(this.id);
    }
  }
  
  class YellowBalloon extends Balloon {
      constructor(id) {
        super(id, 50, "#cccc00");
    }
  }
  
  class RedBalloon extends Balloon {
      constructor(id) {
        super(id, 10, "#cc0000");
    }
  }
  