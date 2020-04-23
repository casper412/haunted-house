var canvas;
var renderTime;

var gameRate = 1.;
var ballonId = 1;

var balloons = {};
var path;
var running = false;
var lastRender;


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

  draw(ctx) {
    ctx.strokeStyle = "#666633";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(this.segments[0][0], this.segments[0][1]);
    for (let segmentPos in this.segments) {
      let segment = this.segments[segmentPos];
      ctx.lineTo(segment[0], segment[1]);
    }
    ctx.stroke();
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
  }

  update(progress) {
    this.pathDistance = this.pathDistance + (progress / 1000) * this.rate;
    var pos = path.getLocation(this.pathDistance);

    if (pos == null) {
      this.kill();
    } else {
      this.x = pos[0];
      this.y = pos[1];
    }
    //this.y = this.y+(progress/1000)*this.rate;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 360);
    ctx.fill();
  }

  kill() {
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
  var ctx = canvas.getContext("2d");
  //  FF 00 00  R G B
  //  Hexadecimal
  //  0 1 2 3 4 5 6 7 8 9 A B C D E F
  //  0x10 => 16 d
  //  0xF0 => 240 d
  //  0xFF => 255 d

  // Render background
  ctx.fillStyle = "#008000";
  ctx.fillRect(0, 0, 400, 400);

  path.draw(ctx);

  // Render Ballons
  Object.keys(balloons).forEach(function(id) {
    let balloon = balloons[id];
    balloon.draw(ctx);
  })
  // Render Towners
}

function loop(timestamp) {
  var progress = timestamp - lastRender
  	
  if (running) {
    update(progress)
  }
  draw()
  renderTime.textContent = round(progress) + " FPS: " + round(1000 / progress);
  
  lastRender = timestamp;
  window.requestAnimationFrame(loop);
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

  canvas = document.getElementById("myCanvas");
  renderTime = document.getElementById("renderTime");

  //setup game
  path = new Path();
  //start rendering
  lastRender = 0;
  window.requestAnimationFrame(loop);
}
