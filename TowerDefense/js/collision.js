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
      this.cellSize = 2;
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

