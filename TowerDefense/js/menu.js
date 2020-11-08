
class Menu {
    constructor(game, layer, x, y, width, height) {
      this.game = game;
      this.layer = layer;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      this.addToLayer(layer);
      
      var x_shift = 10;
      var y_shift = 10;
      this.foot_soldier = new Button(game, "FootSoldierTower", FootSoldierTower,
        layer, this.x + x_shift, this.y + y_shift);
      this.sniper = new Button(game, "SniperTower", SniperTower, 
        layer, this.x + x_shift, this.y + y_shift + this.foot_soldier.height);
    }
  
    addToLayer(layer) {
      this.shape = new Konva.Rect({
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 0.5
      });
      layer.add(this.shape);
    }
  
}

class Button {
  constructor(game, name, towerType, layer, x, y) {
    this.game = game;
    this.name = name;
    this.layer = layer;
    this.towerType = towerType;
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.addToLayer(layer);
  }

  addToLayer(layer) {
    this.shape = new Konva.Circle({
      x: this.x,
      y: this.y,
      radius: 10,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 0.5
    });
    var thisButton = this;
    this.shape.on('click', function() {
      thisButton.click();
    });
    layer.add(this.shape);
  }

  click() {
    this.game.setTypeOfTowerToPlace(this.towerType);
  }
}
