// Megoldások enumra

function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
      enumObject[val] = val;
    }
    return Object.freeze(enumObject);
  }
  
  // { Up: 'Up', Down: 'Down', Left: 'Left', Right: 'Right' }
  createEnum(['Up', 'Down', 'Left', 'Right']);

  class Direction {
    static Up = new Direction('Up');
    static Down = new Direction('Down');
    static Left = new Direction('Left');
    static Right = new Direction('Right');
  
    constructor(name) {
      this.name = name;
    }
    toString() {
      return `Direction.${this.name}`;
    }
  }