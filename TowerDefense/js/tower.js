class Tower {
    constructor(id,x,y,rate) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.rate = rate;
      this.shape = null;
      this.addToLayer(towerLayer);
    }
  
    update(progress) {
      
    }
  
    addToLayer(layer) {
      var width = 20;
      var height = 20;
      var widthOffset = width / 2.;
      var heightOffset = height / 2.;
      /*this.shape = new Konva.Rect({
        x: this.x - widthOffset,
        y: this.y - heightOffset,
        width: width,
        height: height,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 0.5
      });*/
      var imageObj = new Image();
      var animations = {
        idle: [
                0, 0, 50, 56,
               49, 0, 50, 56
              ]
      };
      this.shape = new Konva.Sprite({
        x: this.x - widthOffset,
        y: this.y - heightOffset,
        image: imageObj,
        animation: 'idle',
        animations: animations,
        frameRate: 2,
        frameIndex: 0
      });
      this.shape.start();
      layer.add(this.shape);
      imageObj.src = './assets/generic-sprite.jpg';
    }
  
    
  }

