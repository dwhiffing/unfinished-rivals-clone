import { type, ArraySchema, Schema } from '@colyseus/schema'
import { rivals } from '../../lib/rivals'
import { Hex } from './Hex'
let id = 0
export class Unit extends Schema {
  hex

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

  @type([Hex])
  path = new ArraySchema<Hex>()

  @type('number')
  speed

  constructor(x: number, y: number, team: number) {
    super()

    this.id = ++id
    this.gridX = x
    this.gridY = y
    this.team = team
    this.speed = 10
    const screen = rivals.getScreenPosFromCoords(this.gridX, this.gridY)
    this.x = screen.x
    this.y = screen.y
    const hex = rivals.hexGrid.get({ x, y })
    this.hex = hex
    hex.unit = this
  }
}
