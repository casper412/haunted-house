
class Menu {
    constructor() {
      
    }
  
    addToLayer(layer) {
      this.shape = new Konva.Circle({
        x: this.loc.x,
        y: this.loc.y,
        radius: this.radius,
        fill: this.color,
        stroke: 'black',
        strokeWidth: 0.5
      });
      layer.add(this.shape);
    }
  
}


class Button {
  constructor() {
    
  }


  addToLayer(layer) {
    this.shape = new Konva.Circle({
      x: this.loc.x,
      y: this.loc.y,
      radius: this.radius,
      fill: this.color,
      stroke: 'black',
      strokeWidth: 0.5
    });
    layer.add(this.shape);
  }

}
