
class Level {
  constructor(level) {
    this.level = level;
    this.lastBallonTime = 0;
    this.endTime = 120;
  }

  addBalloon(current_time, timestep) {
    var balloonRate = game.fixed_timestep * 3.;
    if (current_time > (this.lastBallonTime + balloonRate)
        && !this.isLevelOver(current_time)) {
      if (this.addBallonInternal()) {
        this.lastBallonTime = current_time;
      }
    }
  }

  isLevelOver(current_time) {
    return current_time > this.endTime;
  }
}

class LevelRender {
  constructor() {
    this.addToLayer(menuLayer);
  }

  update(progress) {
    var message = "Level " + game.level;
    this.text.text(message);
  }

  addToLayer(layer) {
    this.text = new Konva.Text({
      x: stage.width() - menuWidth + 12,
      y: 35,
      fontFamily: 'Calibri',
      fontSize: 12,
      text: '',
      fill: 'black'
    });
    layer.add(this.text);
  }
}

class LevelOne extends Level {
  constructor() {
    super(1);
  }

  addBallonInternal(current_time, timestep) {
    if (Math.random() > 0.95) {
      game.addBalloon(new RedBalloon(0));
      return true;
    }
    return false;
  }
}

class LevelTwo extends Level {
  constructor() {
    super(2);
  }

  addBallonInternal(current_time, timestep) {
    if (Math.random() > 0.95) {
      game.addBalloon(new YellowBalloon(0));
      return true;
    }
    return false;
  }
}