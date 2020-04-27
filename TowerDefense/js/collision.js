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
      this.cellSize = 10;
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
      var topLeft = balloon.loc.add(new Point(-balloon.radius, -balloon.radius));
      var bottomRight = balloon.loc.add(new Point(balloon.radius, balloon.radius));
      var bottomLeft = balloon.loc.add(new Point(-balloon.radius, balloon.radius));
      var topRight = balloon.loc.add(new Point(balloon.radius, -balloon.radius));
      var topLeftCellPos = this.getCellPos(topLeft);
      var bottomRightCellPos = this.getCellPos(bottomRight);
      var botttomLeftCellPos = this.getCellPos(bottomLeft);
      var topRightCellPos = this.getCellPos(topRight);

      // Add the four corners of the balloon to the tree
      // But only add the balloon once to each cell
      // This assumes the cell size is at least as big as a single balloon
      if (!this.isOffBoard(topLeft.x, topLeft.y)) {
        this.tree[topLeftCellPos[0]][topLeftCellPos[1]].balloons.push(balloon);
      }
      if (!this.isOffBoard(bottomRight.x, bottomRight.y)) {
        if (!this.cellPosEqual(topLeftCellPos, bottomRightCellPos)) {
          this.tree[bottomRightCellPos[0]][bottomRightCellPos[1]].balloons.push(balloon);
        }
      }
      if (!this.isOffBoard(bottomLeft.x, bottomLeft.y)) {
        if (!this.cellPosEqual(topLeftCellPos, bottomRightCellPos)
            || !this.cellPosEqual(bottomRightCellPos, botttomLeftCellPos)) {
          this.tree[botttomLeftCellPos[0]][botttomLeftCellPos[1]].balloons.push(balloon);
        }
      }
      if (!this.isOffBoard(topRight.x, topRight.y)) {
        if (!this.cellPosEqual(topLeftCellPos, bottomRightCellPos)
            || !this.cellPosEqual(bottomRightCellPos, botttomLeftCellPos)
            || !this.cellPosEqual(botttomLeftCellPos, topRightCellPos)) {
          this.tree[topRightCellPos[0]][topRightCellPos[1]].balloons.push(balloon);
        }
      }
    }

    addBullet(bullet) {
      var cellPos = this.getCellPos(bullet.loc);
      this.tree[cellPos[0]][cellPos[1]].bullets.push(bullet);
    }

    getFirstBalloons(location, range) {
      var cellPos = this.getCellPos(location);
      var balloons = [];
      var balloonIds = {};
      var cellRange = Math.ceil(range / this.cellSize);
      var xstart = Math.max(0, cellPos[0] - cellRange);
      var xend = Math.min(this.tableWidth, cellPos[0] + cellRange);
      var ystart = Math.max(0, cellPos[1] - cellRange);
      var yend = Math.min(this.tableHeight, cellPos[1] + cellRange);
      for (var x = xstart; x < xend; x++) {
        for (var y = ystart; y < yend; y++) {
          this.tree[x][y].balloons.forEach(balloon => {
            // Only add a balloon once to the list
            if (!balloonIds[balloon.id]) {
              balloons.push(balloon);
              balloonIds[balloon.id] = balloon.id;
            }
          });
        }
      }

      balloons.sort((a, b) => b.pathDistance - a.pathDistance);
      return balloons;
    }

    processCollisions(game) {
      this.tree.forEach(function(column) {
        column.forEach(function(cell) {
          if (cell.bullets.length > 0) {
            cell.bullets.forEach(bullet => {
              cell.balloons.forEach(balloon => {
                var delta = bullet.loc.minus(balloon.loc);
                var dist = delta.getLength();
                if (dist < balloon.radius + bullet.radius) {
                  balloon.kill();
                }
              });
            });
          }//if
        });//cell
      });//column
    }

    getCellPos(location) {
      return [
        Math.floor(location.x / this.cellSize),
        Math.floor(location.y / this.cellSize)
      ];
    }
    
    isOffBoard(x, y) {
      if (x < 0 || x > this.width) {
        return true;
      }
      if (y < 0 || y > this.height) {
        return true;
      }
      return false;
    }

    cellPosEqual(cp1, cp2) {
      return cp1[0] == cp2[0] && cp1[1] == cp2[1]
    }
  }

