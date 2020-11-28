import { type, Schema } from '@colyseus/schema'

export class Hex extends Schema {
  @type('number')
  x

  @type('number')
  y

  @type('number')
  index = 0

  constructor(x: number, y: number, index: number) {
    super()
    this.x = x
    this.y = y

    this.index = index
  }
}
