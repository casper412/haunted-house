
class Player {
    constructor(x, y, width, height) {
      this.money = 300;
      this.experience = 0;
      this.health = 150;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.addToLayer(menuLayer);
    }
    
    buy(amount) {
      if (this.money > amount) {
        this.money -= amount;
      } else {
        throw "Cannot buy item";
      }
    }

    earn(hits) {
      this.money += hits * 10.;
    }

    getMoney() {
      return this.money;
    }

    hurt(amount) {
      if (this.health > amount) {
        this.health -= amount;
      } else {
        game.gameOver();
      }
    }

    heal(amount) {
      this.health += amount;
    }

    getHealth() {
      return this.health;
    }

    advance(hits) {
      this.experience += hits * 20.;
    }

    getExperience() {
      return this.experience;
    }

    update(progress) {
      var message = "$" + this.money + " XP: " + this.experience + "\n\tHeart: " + this.health;
      this.text.text(message);
    }

    addToLayer(layer) {
      this.text = new Konva.Text({
        x: this.x + 10,
        y: 10,
        fontFamily: 'Calibri',
        fontSize: 12,
        text: '',
        fill: 'black'
      });
      layer.add(this.text);
    }
}

