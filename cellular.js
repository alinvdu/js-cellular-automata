const RULES = {
  Conway: "23/3",
};

const SPEED = 1000;

class Rule {
  constructor(ruleString) {
    this.ruleString = ruleString;
    const arr = ruleString.split("/");
    this.survive = arr[0];
    this.birth = arr[1];
  }

  getNextState(state, adjActive) {
    if (state) {
      return this.survive.indexOf("" + adjActive) > -1;
    } else {
      return this.birth.indexOf("" + adjActive) > -1;
    }
  }
}

class Grid {
  constructor(width, height, ruleName) {
    this.width = width;
    this.height = height;
    this.rule = new Rule(RULES[ruleName]);
    this.current = [];
    this.next = [];
    this.reset();
  }

  generateNextGrid() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.setNextState(i, j);
      }
    }
  }

  updateConvasDimensions(width, height) {
    this.width = width;
    this.height = height;
  }

  setNextState(x, y) {
    var adjActive = 0,
      n = y - 1 < 0 ? this.height - 1 : y - 1,
      e = x + 1 >= this.width ? 0 : x + 1,
      s = y + 1 >= this.height ? 0 : y + 1,
      w = x - 1 < 0 ? this.width - 1 : x - 1;

    if (this.current[w][n]) adjActive++; // nw
    if (this.current[x][n]) adjActive++; // n
    if (this.current[e][n]) adjActive++; // ne
    if (this.current[w][y]) adjActive++; // w
    if (this.current[e][y]) adjActive++; // e
    if (this.current[w][s]) adjActive++; // sw
    if (this.current[x][s]) adjActive++; // s
    if (this.current[e][s]) adjActive++; // se

    this.next[x][y] = this.rule.getNextState(this.current[x][y], adjActive);
  }

  pushBackGrid() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.current[i][j] = this.next[i][j];
      }
    }
  }

  reset() {
    for (let i = 0; i < this.width; i++) {
      this.current[i] = [];
      this.next[i] = [];

      for (let j = 0; j < this.height; j++) {
        this.current[i][j] = false;
        this.next[i][j] = false;
      }
    }
  }
}

class Environment {
  constructor(grid, speed) {
    this.grid = grid;
    this.speed = speed;

    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    this.updateConvasDimensions();
  }

  updateConvasDimensions() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.grid.updateConvasDimensions(this.canvas.width, this.canvas.height);
    this.grid.reset();

    this.seed();
  }

  play() {
    const animate = () => {
      this.generateNextGrid();
      setTimeout(() => animate(), Math.round(1000 / this.speed));
    };

    animate();
  }

  generateNextGrid() {
    for (let i = 0; i < this.grid.width; i++) {
      for (let j = 0; j < this.grid.height; j++) {
        this.grid.setNextState(i, j);

        if (this.grid.current[i][j] !== this.grid.next[i][j]) {
          this.putPixelInState(i, j, this.grid.next[i][j]);
        }
      }
    }

    this.grid.pushBackGrid();
  }

  putPixelInState(x, y, state) {
    if (state) {
      this.putPixel(x, y, "#000");
    } else {
      this.putPixel(x, y, "green");
    }
  }

  putPixel(x, y, color) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, 1, 1);
  }

  reset() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.reset();
  }

  seed() {
    for (let i = 0; i < this.grid.width; i++) {
      for (let j = 0; j < this.grid.height; j++) {
        if (Math.floor(Math.random() * 20 + 1) === 1) {
          this.setCell(i, j, true);
        }
      }
    }
  }

  setCell(x, y, state) {
    this.putPixelInState(x, y, state);
    this.grid.current[x][y] = state;
  }
}

const env = new Environment(
  new Grid(window.innerWidth, window.innerHeight, "Conway"),
  SPEED
);
env.play();

addEventListener("resize", () => {
  env.updateConvasDimensions();
});
