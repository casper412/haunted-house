
class Balloon {
    constructor(id, hitPoints) {
      this.id = id;
      this.loc = new Point(0, 0);
      this.rate = this.getRate(hitPoints);
      this.color = this.getColor(hitPoints);
      this.pathDistance = 0;
      this.shape = null;
      this.radius = 5;
      this.hitPoints = hitPoints;
      this.addToLayer(balloonLayer);
    }
  
    update(progress) {
      this.pathDistance = this.pathDistance + progress * this.rate;
      var pos = game.path.getLocation(this.pathDistance);
  
      if (pos == null) {
        this.die();
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
  
    shot(possibleHits) {
      var hits = this.kill(possibleHits);
      player.earn(hits);
      player.advance(hits);
      return hits;
    }

    die() {
      player.hurt(1);
      while(this.hitPoints > 0) {
        this.kill();
      }
    }

    kill(possibleHits) {
      var hits = Math.min(possibleHits, this.hitPoints);
      this.hitPoints -= hits;
      if (this.hitPoints <= 0) {
        this.shape.remove();
        game.removeBalloon(this.id);
      } else {
        this.color = this.getColor(this.hitPoints);
        this.rate = this.getRate(this.hitPoints);
        this.shape.fill(this.color);
      }
      return hits;
    }

    getColor(hitPoints) {
      switch(hitPoints) {
        case 1:
          return "#cc0000";
        case 2:
            return "#0000cc";
        case 3:
          return "#00cc00";
        case 4:
          return "#00cccc";
        case 5:
          return "#cccc00";
      }
    }

    getRate(hitPoints) {
      switch(hitPoints) {
        case 1:
          return 10;
        case 2:
            return 20;
        case 3:
          return 30;
        case 4:
          return 40;
        case 5:
          return 50;
      }
    }
}
  
class YellowBalloon extends Balloon {
    constructor(id) {
      super(id, 5);
  }
}

class RedBalloon extends Balloon {
    constructor(id) {
      super(id, 1);
  }
}
