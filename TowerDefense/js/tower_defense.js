
var stage;
var backgroundLayer;
var towerLayer;
var balloonLayer;
var menuLayer;

var game;
var lastRender;
var fpsMovingAverage = 60;
var textBarHeight = 50;
var menuWidth = 100;

class Game {
  constructor(width, height) {
    this.gameRate = 1.;
    this.maxGameRate = 10.;
    this.minGameRate = 0.1;
    this.balloonId = 1;
    this.bulletId = 1;

    this.balloons = {};
    this.towers = [];
    this.bullets = {};
    this.path = new Path();
    this.running = false;
    this.fixed_timestep = 0.1; // 200 ms
    this.current_time = 0.;
    this.collision = new Collision(width, height);
  }

  isOffBoard(x, y) {
    return this.collision.isOffBoard(x, y);
  }
  
  addRandomBallon() {
    if (Math.random() > 0.95) {
      var id = this.balloonId++;
      if (Math.random() > 0.5) {
        this.balloons[id] = new YellowBalloon(id);
      } else {
        this.balloons[id] = new RedBalloon(id);
      } 
    }
  }

  addBullet(location, direction, rate, range) {
    var id = this.bulletId++;
    this.bullets[id] = new Bullet(id, location, direction, rate, range);
  }

  addTower(point) {
    this.towers.push(new BasicTower(0, point));
  }

  removeBalloon(id) {
    delete this.balloons[id];
  }

  removeBullet(id) {
    delete this.bullets[id];
  }
  
  do_update(timestep) {
    this.current_time += timestep;
    this.addRandomBallon();
    
    this.collision.clear();
    // Update the state of the world for the elapsed time since last render
    Object.keys(this.balloons).forEach(function(id) {
      let balloon = this.balloons[id];
      if (balloon.update(timestep)) {
        this.collision.addBallon(balloon);
      }
    }.bind(this));

    game.towers.forEach(function(tower) {
      tower.update(this.current_time, timestep, this.collision);
    }.bind(this));

    Object.keys(game.bullets).forEach(function(id) {
      let bullet = this.bullets[id];
      if (bullet.update(timestep)) {
        this.collision.addBullet(bullet);
      }
    }.bind(this));

    this.collision.processCollisions(game);
  }

  update(progress) {
    var total_timestep = progress / 1000 * this.gameRate;
    var time = 0;
    total_timestep = Math.min(total_timestep, 1.);
    while (time < total_timestep) {
      var timestep = this.fixed_timestep;
      if (time + this.fixed_timestep > total_timestep) {
        timestep = total_timestep - time;
      }
      time += timestep;
      this.do_update(timestep);
    }
  }

  doStop() {
    this.running = false;
  }

  doFaster() {
    this.gameRate *= 2.;
    this.gameRate = Math.min(this.gameRate, this.maxGameRate);
  }

  doSlower() {
    this.gameRate /= 2.;
    this.gameRate = Math.max(this.gameRate, this.minGameRate);
  }

  doStart() {
    this.running = true;
  }
}

class Path {
  constructor() {
    this.segments = [
      new Point(0, 40),
      new Point(210, 40),
      new Point(210, 100),
      new Point(400, 400)
    ];
  }

  addToLayer(layer) {
    var points = []
    for (let segmentPos in this.segments) {
      let segment = this.segments[segmentPos];
      points.push(segment.x);
      points.push(segment.y);
    }

    var poly = new Konva.Line({
      points: points,
      fill: "black",
      stroke: '#666633',
      strokeWidth: 14,
      closed: false
    });
    layer.add(poly);
  }

  getLocation(pathDistance) {
    var remainingDist = pathDistance;
    var current = this.segments[0];
    for (let segmentPos = 1; segmentPos < this.segments.length; segmentPos++) {
      let segment = this.segments[segmentPos];
      var next = segment;
      var delta = next.minus(current);
      var dist = delta.getLength();
      if (dist > remainingDist) {
        var offset = delta.times(remainingDist / dist);
        return current.add(offset);
      } else {
        current = next;
        remainingDist -= dist;
      }
    }
    return null;
  }

  getLineSegments(pathDistance) {
    var remainingDist = pathDistance;
    var current = this.segments[0];
    for (let segmentPos = 1; segmentPos < this.segments.length; segmentPos++) {
      let segment = this.segments[segmentPos];
      var next = segment;
      var delta = next.minus(current);
      var dist = delta.getLength();
      if (dist > remainingDist) {
        var segments = [];
        var offset = delta.times(remainingDist / dist);
        var ncurrent = current.add(offset);
        // First segment starts at the balloon location
        for (let nSegmentPos = segmentPos; nSegmentPos < this.segments.length; nSegmentPos++) {
          let nsegment = this.segments[nSegmentPos];
          segments.push({a: ncurrent, b: nsegment});
          ncurrent = nsegment;
        }
        return segments;
      } else {
        current = next;
        remainingDist -= dist;
      }
    }
    return null;
  }
}

function round(val) {
  return Math.floor(val * 10 + 0.5) / 10
}

function draw() {
  backgroundLayer.batchDraw();
  towerLayer.batchDraw();
  balloonLayer.batchDraw();
  menuLayer.batchDraw();
}

function loop() {
  var timestamp = Date.now();
  var progress = timestamp - lastRender
  	
  if (game.running) {
    game.update(progress)
  }
  draw()
  fpsMovingAverage = (1000 / progress) * 0.05 + fpsMovingAverage * 0.95;
  renderTime.textContent = round(progress) 
      + " FPS: " + round(fpsMovingAverage)
      + " Game Speed: " + round(game.gameRate);
  
  lastRender = timestamp;
}

function setupStage() {
  var canvas = document.getElementById("myCanvas");
  
  stage = new Konva.Stage({
    container: 'myCanvas',
    height: canvas.clientHeight,
    width: canvas.clientWidth
  });

  menuLayer = new Konva.Layer();
  backgroundLayer = new Konva.Layer();
  towerLayer = new Konva.Layer();
  balloonLayer = new Konva.FastLayer();

  var background = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width() - menuWidth,
    height: stage.height() - textBarHeight,
    fill: 'green',
    strokeWidth: 0
  });

  var text = new Konva.Text({
    x: 10,
    y: stage.height() - textBarHeight,
    fontFamily: 'Calibri',
    fontSize: 24,
    text: '',
    fill: 'black'
  });

  background.on('mousedown touchstart', function() {
    var touchPos = stage.getPointerPosition();
    game.addTower(new Point(touchPos.x, touchPos.y));

    message = 'x: ' + touchPos.x + ', y: ' + touchPos.y;
    text.text(message);
    backgroundLayer.draw();

  });

  backgroundLayer.add(background);
  backgroundLayer.add(text);
  game.path.addToLayer(backgroundLayer);

  // add the layer to the stage
  stage.add(backgroundLayer);
  stage.add(towerLayer);
  stage.add(balloonLayer);
  stage.add(menuLayer);
}

//Game start
function init() {
  //setup buttons
  var stopButton = document.getElementById("stop");
  var fasterButton = document.getElementById("faster");
  var slowerButton = document.getElementById("slower");
  var startButton = document.getElementById("start");
  var canvas = document.getElementById("myCanvas");
  
  game = new Game(canvas.clientWidth - menuWidth, canvas.clientHeight - textBarHeight);
  stopButton.onclick = function(){game.doStop()};
  fasterButton.onclick = function(){game.doFaster()};
  slowerButton.onclick = function(){game.doSlower()};
  startButton.onclick = function(){game.doStart()};

  renderTime = document.getElementById("renderTime");

  setupStage();

  //start rendering
  lastRender = Date.now();
  setInterval(loop, 16);
}
