import { type, Schema } from '@colyseus/schema'

export class Hex extends Schema {
  @type('number')
  x

  @type('number')
  y

  @type('number') // 0: empty, 1: wall, 2: resources, 3: pad
  index = 0

  constructor({ x, y, index = 0 }) {
    super()
    this.x = x
    this.y = y
    this.index = index
  }
}
