import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Hex } from './Hex'

export class Unit extends Schema {
  @type('number')
  id

  @type('number')
  x

  @type('number')
  y

  @type('number')
  gridX

  @type('number')
  gridY

  @type('number')
  team

  @type('number')
  speed = 20

  @type([Hex])
  path = new ArraySchema<Hex>()

  constructor({ id, x, y, gridX, gridY, team }) {
    super()

    this.id = id
    this.gridX = gridX
    this.gridY = gridY
    this.team = team
    this.x = x
    this.y = y
  }
}
