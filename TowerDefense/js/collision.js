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
      this.tableWidth = Math.ceil(this.width / this.cellSize);
      this.tableHeight = Math.ceil(this.height / this.cellSize);
      const range = (start, stop, step) => 
        Array.from(
          { length: (stop - start) / step + 1}, 
          (_, i) => start + (i * step));

      this.tree = Array.from(
        range(0, this.tableWidth, 1),
        x => 
          Array.from(range(0, this.tableHeight, 1),
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
      var cellPos = this.getCellPos(balloon.loc);
      this.tree[cellPos[0]][cellPos[1]].balloons.push(balloon);
    }

    addBullet(bullet) {
      var cellPos = this.getCellPos(bullet.loc);
      this.tree[cellPos[0]][cellPos[1]].bullets.push(bullet);
    }

    getFirstBalloon(location, range) {
      var cellPos = this.getCellPos(location);
      var balloons = [];
      var cellRange = Math.ceil(range / this.cellSize);
      var xstart = Math.max(0, cellPos[0] - cellRange);
      var xend = Math.min(this.tableWidth, cellPos[0] + cellRange);
      var ystart = Math.max(0, cellPos[1] - cellRange);
      var yend = Math.min(this.tableHeight, cellPos[1] + cellRange);
      for (var x = xstart; x < xend; x++) {
        for (var y = ystart; y < yend; y++) {
          balloons = balloons.concat(this.tree[x][y].balloons);
        }
      }

      balloons.sort((a, b) => b.pathDistance - a.pathDistance);

      for (var i = 0; i < balloons.length; i++) {
        var delta = location.minus(balloons[i].loc);
        if (delta.getLength() < range) {
          return balloons[i];
        }
      }
      return null;
    }

    getCellPos(location) {
      return [
        Math.floor(location.x / this.cellSize),
        Math.floor(location.y / this.cellSize)
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

