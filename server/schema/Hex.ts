import { type, Schema } from '@colyseus/schema'

export class Hex extends Schema {
  @type('number')
  x

  @type('number')
  y

  constructor(x: number, y: number) {
    super()
    this.x = x
    this.y = y
  }
}
