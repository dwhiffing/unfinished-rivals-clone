import { type, Schema } from '@colyseus/schema'

const WALL_COORDS = [
  // left base
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [0, 2],
  [1, 2],

  // left rocks
  [0, 4],
  [0, 5],
  [0, 6],
  [1, 6],

  // right base
  [10, 0],
  [11, 0],
  [9, 1],
  [10, 1],
  [11, 1],
  [10, 2],
  [11, 2],

  // right rocks
  [11, 3],
  [11, 4],
  [10, 5],
  [11, 5],
  [10, 6],
  [11, 6],

  // middle rocks
  [3, 2],
  [2, 3],
  [5, 3],
  [5, 5],
  [8, 2],
  [8, 3],
]

export class Hex extends Schema {
  @type('number')
  x

  @type('number')
  y

  @type('number')
  index = 0

  constructor(x: number, y: number) {
    super()
    this.x = x
    this.y = y

    WALL_COORDS.forEach(([x, y]) => {
      if (this.x === x && this.y === y) {
        this.index = 2
      }
    })
  }
}
