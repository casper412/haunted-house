class Tower {    
    constructor(id, location, image, animations, 
        firing_rate, bullet_speed, bullet_hit_points, range) {
      this.id = id;
      this.loc = location;
      this.image = image;
      this.animations = animations;
      this.firing_rate = firing_rate;
      this.bullet_speed = bullet_speed;
      this.bullet_hit_points = bullet_hit_points;
      this.range = range;
      this.last_fire = 0;
      this.shape = null;
      this.addToLayer(towerLayer);
    }
  
    getFiringDirection(balloon) {
      //var dir = balloon.loc.minus(this.loc);
      //var mag = dir.getLength();
      //var unit_dir = dir.times(1. / mag);
      //return unit_dir;
      var path = game.path;
      var segments = path.getLineSegments(balloon.pathDistance);
      var timeToSegment = 0.; // Already on the first segment
      var maxTimeOfFlight = this.range / this.bullet_speed; // time = distance / rate
      for (let segmentPos = 0; segmentPos < segments.length; segmentPos++) {
        let segment = segments[segmentPos];
        var src = this.loc;
        var dst = segment.a;
        var balloonDir = segment.b.minus(dst);
        balloonDir = balloonDir.times(1 / balloonDir.getLength() * balloon.rate);
        // Create a virtual segment as if the balloon had a running start
        var backUp = balloonDir.times(-1. * timeToSegment);
        dst = dst.add(backUp);
        dst.vx = balloonDir.x;
        dst.vy = balloonDir.y;
        var remainingSegment = segment.b.minus(dst);
        
        // How long are you on this segment?
        let dist = remainingSegment.getLength();
        let timeToSegmentEnd = dist / balloon.rate; // time = distance / rate

        var interceptPt = this.intercept(src, dst, this.bullet_speed, maxTimeOfFlight, timeToSegmentEnd);
        if (interceptPt) {
          var firing_vec = new Point(interceptPt.x - this.loc.x, interceptPt.y - this.loc.y);
          let fire_dist = firing_vec.getLength();
          return firing_vec.times(1. / fire_dist);
        }
        // Accrue time to the start of the next segment
        timeToSegment = timeToSegmentEnd;
        // If we can't hit this balloon this segment then can we hit it on the next segment
        if (timeToSegment > maxTimeOfFlight) {
          // We can't hit balloons on the next segment
          break;
        }
      }
      return null;
    }

    update(current_time, progress, collision) {
      // Can I Fire Again?
      if (current_time - this.last_fire > this.firing_rate) {
        // Get balloons that may be in range?
        var balloons = collision.getFirstBalloons(this.loc, this.range);
        for (var i = 0; i < balloons.length; i++) {
          var delta = this.loc.minus(balloons[i].loc);
          // Is the balloon in range?
          var dir = this.getFiringDirection(balloons[i]);
          if (dir) {
            // Decide to fire
            game.addBullet(this.loc.copy(), dir, this.bullet_speed, this.bullet_hit_points, this.range);
            this.last_fire = current_time;
            break;
          }
        }
      }
    }
  
    kill() {
      this.shape.remove();
    }

    addToLayer(layer) {
      var width = 50;
      var height = 50;
      var widthOffset = width / 2.;
      var heightOffset = height / 2.;
      var imageObj = new Image();
      this.shape = new Konva.Sprite({
        x: this.loc.x - widthOffset,
        y: this.loc.y - heightOffset,
        image: imageObj,
        animation: 'idle',
        animations: this.animations,
        frameRate: 2,
        frameIndex: 0
      });
      this.shape.start();
      layer.add(this.shape);
      imageObj.src = this.image;

      // Event handlers
      var thisTower = this;
      this.shape.on('click', function() {
        thisTower.click();
      });
    }

    click() {
      game.upgrade_menu.setupMenu(this);
    }

    /**
     * Return the firing solution for a projectile starting at 'src' with
     * velocity 'v', to hit a target, 'dst'.
     *
     * @param Object src position of shooter
     * @param Object dst position & velocity of target
     * @param Number v   speed of projectile
     * @return Object Coordinate at which to fire (and where intercept occurs)
     *
     * E.g.
     * >>> intercept({x:2, y:4}, {x:5, y:7, vx: 2, vy:1}, 5)
     * = {x: 8, y: 8.5}
     */
    intercept(src, dst, v, maxTimeOfFlight, timeToSegmentEnd) {
      var tx = dst.x - src.x,
          ty = dst.y - src.y,
          tvx = dst.vx,
          tvy = dst.vy;

      // Get quadratic equation components
      var a = tvx*tvx + tvy*tvy - v*v;
      var b = 2 * (tvx * tx + tvy * ty);
      var c = tx*tx + ty*ty;    

      // Solve quadratic
      var ts = this.quad(a, b, c); // See quad(), below

      // Find smallest positive solution
      var sol = null;
      if (ts) {
        var t0 = ts[0], t1 = ts[1];
        var t = Math.min(t0, t1);
        if (t < 0) t = Math.max(t0, t1);    
        if (t > 0 && t < timeToSegmentEnd && t < maxTimeOfFlight) {
          sol = {
            x: dst.x + dst.vx*t,
            y: dst.y + dst.vy*t
          };
        }
      }
      return sol;
    }

    /**
     * Return solutions for quadratic
     */
    quad(a,b,c) {
      var sol = null;
      if (Math.abs(a) < 1e-6) {
        if (Math.abs(b) < 1e-6) {
          sol = Math.abs(c) < 1e-6 ? [0,0] : null;
        } else {
          sol = [-c/b, -c/b];
        }
      } else {
        var disc = b*b - 4*a*c;
        if (disc >= 0) {
          disc = Math.sqrt(disc);
          a = 2*a;
          sol = [(-b-disc)/a, (-b+disc)/a];
        }
      }
      return sol;
    }
}

class FootSoldierTower extends Tower {
  static cost = 50;
  static image = './assets/footman.png';
  static animations = { // Animations
    idle: [
            0, 0, 75, 75,
          ]
  };
  static bullet_hit_points = 1;
  constructor(id, location) {
    super(id, location, FootSoldierTower.image, FootSoldierTower.animations,
      2.0, 100., FootSoldierTower.bullet_hit_points, 100.);
  }
}

class SniperTower extends Tower {
  static cost = 75;
  static image = './assets/sniper.png';
  static animations = { // Animations
    idle: [
            0, 0, 75, 75,
          ]
  };
  static bullet_hit_points = 3;
  constructor(id, location) {
    super(id, location, SniperTower.image, SniperTower.animations,
      3.0, 620., SniperTower.bullet_hit_points, 450.);
  }
}
