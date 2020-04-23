
var stage;
var backgroundLayer;
var towerLayer;
var balloonLayer;

var gameRate = 1.;
var ballonId = 1;

var balloons = {};
var path;
var running = false;
var lastRender;
var menuWidth = 100;

function doStop() {
  running = false;
}

function doFaster() {
  gameRate *= 2.;
}

function doSlower() {
  gameRate /= 2.;
}

function doStart() {
  running = true;
}

class Path {
  constructor() {
    this.segments = [
      [0, 40],
      [210, 40],
      [210, 100],
      [400, 400]
    ];
  }

  addToLayer(layer) {
    var points = []
    for (let segmentPos in this.segments) {
      let segment = this.segments[segmentPos];
      points.push(segment[0]);
      points.push(segment[1]);
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
    var cummulativeDist = 0;
    var remainingDist = pathDistance;
    var currentX = this.segments[0][0];
    var currentY = this.segments[0][1];
    for (let segmentPos = 1; segmentPos < this.segments.length; segmentPos++) {
      let segment = this.segments[segmentPos];
      var nextX = segment[0];
      var nextY = segment[1];
      var deltaX = nextX - currentX;
      var deltaY = nextY - currentY;
      var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (dist > remainingDist) {
        var offsetX = deltaX / dist * remainingDist;
        var offsetY = deltaY / dist * remainingDist;
        return [currentX + offsetX, currentY + offsetY];
      } else {
        currentX = nextX;
        currentY = nextY;
        remainingDist -= dist;
      }
    }
    return null;
  }
}

class Balloon {
  constructor(id, rate, color) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.rate = rate;
    this.color = color;
    this.pathDistance = 0;
    this.shape = null;
    this.addToLayer(balloonLayer);
  }

  update(progress) {
    this.pathDistance = this.pathDistance + (progress / 1000) * this.rate;
    var pos = path.getLocation(this.pathDistance);

    if (pos == null) {
      this.kill();
    } else {
      this.x = pos[0];
      this.y = pos[1];
      this.shape.x(this.x);
      this.shape.y(this.y);
    }
    //this.y = this.y+(progress/1000)*this.rate;
  }

  addToLayer(layer) {
    this.shape = new Konva.Circle({
      x: this.x,
      y: this.y,
      radius: 5,
      fill: this.color,
      stroke: 'black',
      strokeWidth: 0.5
    });
    layer.add(this.shape);
  }

  kill() {
    this.shape.remove();
    delete balloons[this.id];
  }
}

class YellowBalloon extends Balloon {
	constructor(id) {
  	super(id, 40, "#cccc00");
  }
}

class RedBalloon extends Balloon {
	constructor(id) {
  	super(id, 10, "#cc0000");
  }
}

function round(val) {
  return Math.floor(val * 10 + 0.5) / 10
}

function update(progress) {
  var timestep = progress * gameRate;

  if (Math.random() > 0.99) {
    var id = ballonId++;
    if (Math.random() > 0.5) {
    	balloons[id] = new YellowBalloon(id);
    } else {
      balloons[id] = new RedBalloon(id);
    } 
  }


  // Update the state of the world for the elapsed time since last render
  Object.keys(balloons).forEach(function(id) {
    let balloon = balloons[id];
    balloon.update(timestep);
  })
}

function draw() {
 backgroundLayer.batchDraw();
 towerLayer.batchDraw();
 balloonLayer.batchDraw();
}

function loop() {
  var timestamp = Date.now();
  var progress = timestamp - lastRender
  	
  if (running) {
    update(progress)
  }
  draw()
  renderTime.textContent = round(progress) + " FPS: " + round(1000 / progress);
  
  lastRender = timestamp;
}

function setupStage() {
  var canvas = document.getElementById("myCanvas");
  
  stage = new Konva.Stage({
    container: 'myCanvas',
    height: canvas.clientHeight,
    width: canvas.clientWidth
  });

  backgroundLayer = new Konva.Layer();
  towerLayer = new Konva.Layer();
  balloonLayer = new Konva.Layer();

  var background = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width() - menuWidth,
    height: stage.height(),
    fill: 'green',
    strokeWidth: 0
  });

  var text = new Konva.Text({
    x: 10,
    y: 10,
    fontFamily: 'Calibri',
    fontSize: 24,
    text: '',
    fill: 'black'
  });

  background.on('mousedown touchstart', function() {
    var touchPos = stage.getPointerPosition();
    new Tower(0, touchPos.x, touchPos.y, 1.0);

    message = 'x: ' + touchPos.x + ', y: ' + touchPos.y;
    text.text(message);
    backgroundLayer.draw();

  });

  backgroundLayer.add(background);
  backgroundLayer.add(text);
  path.addToLayer(backgroundLayer);

  // add the layer to the stage
  stage.add(backgroundLayer);
  stage.add(towerLayer);
  stage.add(balloonLayer);
}

//Game start
function init() {
  //setup buttons
  var stopButton = document.getElementById("stop");
  var fasterButton = document.getElementById("faster");
  var slowerButton = document.getElementById("slower");
  var startButton = document.getElementById("start");

  stopButton.onclick = doStop;
  fasterButton.onclick = doFaster;
  slowerButton.onclick = doSlower;
  startButton.onclick = doStart;

  //canvas = document.getElementById("myCanvas");
  renderTime = document.getElementById("renderTime");

  //setup game
  path = new Path();
  setupStage();

  //start rendering
  lastRender = Date.now();
  setInterval(loop, 16);
}
