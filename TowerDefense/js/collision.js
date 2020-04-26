class Cell {
  constructor() {
    this.balloons = [];
    this.bullets = [];
  }
}

class Collision {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.cellSize = 4;
      this.tableWidth = this.width / this.cellSize;
      this.tableHeight = this.height / this.cellSize;
      const range = (start, stop, step) => 
        Array.from(
          { length: (stop - start) / step + 1}, 
          (_, i) => start + (i * step));

      this.tree = Array.from(
        range(0, width + 1, this.cellSize),
        x => 
          Array.from(range(0, height + 1, this.cellSize),
          y => new Cell()));
    }
  
    clear() {
      this.tree.forEach(function(column) {
        column.forEach(function(cell) {
          cell.balloons.length = 0;
          cell.bullets.length = 0;
        });
      });
    }

    addBallon(balloon) {
      var cellPos = this.getCellPos(balloon.x, balloon.y);
      this.tree[cellPos[0]][cellPos[1]].balloons.push(balloon);
    }

    addBullet(bullet) {
      var cellPos = this.getCellPos(bullet.x, bullet.y);
      this.tree[cellPos[0]][cellPos[1]].bullets.push(bullet);
    }

    getDistance(x, y, x2, y2) {
      var xdelta = (x - x2);
      var ydelta = (y - y2);
      return Math.sqrt(xdelta * xdelta + ydelta * ydelta);
    }

    getFirstBalloon(x, y, range) {
      var cellPos = this.getCellPos(x, y);
      var balloons = [];
      var cellRange = Math.ceil(range / this.cellSize);
      var xstart = Math.max(0, cellPos[0] - cellRange);
      var xend = Math.min(this.width, cellPos[0] + cellRange);
      var ystart = Math.max(0, cellPos[1] - cellRange);
      var yend = Math.min(this.height, cellPos[1] + cellRange);
      for (var x = xstart; x < xend; x++) {
        for (var y = ystart; y < yend; y++) {
          balloons = balloons.concat(this.tree[x][y].balloons);
        }
      }

      balloons.sort((a, b) => b.pathDistance - a.pathDistance);

      for (var i = 0; i < balloons.length; i++) {
        if (this.getDistance(x, y, balloons[i].x, balloons[i].y) < range) {
          return balloons[i];
        }
      }
      return null;
    }

    getCellPos(x, y) {
      return [
        Math.floor(x/this.cellSize),
        Math.floor(y/this.cellSize)
      ];
    }
    
    processCollisions(game) {
      this.tree.forEach(function(column) {
        column.forEach(function(cell) {
          if (cell.bullets.length > 0) {
            cell.balloons.forEach(function (balloon) {
              balloon.kill();
            });
          }
        })
      });
    }
  }

