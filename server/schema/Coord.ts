import { type, Schema } from '@colyseus/schema'

export class Coord extends Schema {
  @type('number')
  x

  @type('number')
  y

  constructor({ x = 0, y = 0 } = {}) {
    super()
    this.x = x
    this.y = y
  }
}
