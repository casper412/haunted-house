
class UpgradeMenu {
    constructor(game, layer, x, y, width, height) {
      this.game = game;
      this.layer = layer;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      this.addToLayer();
    }
  
    addToLayer() {
      this.shape = new Konva.Rect({
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 0.5
      });
      this.layer.add(this.shape);
    }

    setupMenu(tower) {
      var x_shift = 10;
      var y_shift = 10;
      this.foot_soldier = new UpgradeButton(game, "FootSoldierTower", FootSoldierTower,
        this.layer, this.x + x_shift, this.y + y_shift);
      this.sniper = new UpgradeButton(game, "SniperTower", SniperTower, 
        this.layer, this.x + x_shift, this.y + y_shift + this.foot_soldier.height);
    }
}

class UpgradeButton {
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
    var widthOffset = this.width / 2.;
    var heightOffset = this.height / 2.;
    var imageObj = new Image();
    this.shape = new Konva.Sprite({
      x: this.x - widthOffset,
      y: this.y - heightOffset,
      scaleX: this.width / 50,
      scaleY: this.height / 50,
      image: imageObj,
      animation: 'idle',
      animations: this.towerType.animations,
      frameRate: 2,
      frameIndex: 0
    });
    this.shape.start();
    imageObj.src = this.towerType.image;
    layer.add(this.shape);
    // Event handlers
    var thisButton = this;
    this.shape.on('click', function() {
      thisButton.click();
    });
  }

  click() {
    this.game.setTypeOfTowerToPlace(this.towerType);
  }
}
