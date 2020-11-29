import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Hex } from './Hex'

export class Pad extends Schema {
  @type('number')
  status = -1

  @type([Hex])
  hexes = new ArraySchema<Hex>()

  constructor({ status, hexes }) {
    super()
    this.status = status
    this.hexes = hexes.map((h) => new Hex(h))
  }
}
