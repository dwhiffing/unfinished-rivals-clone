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
  damage

  @type('number')
  health

  @type('number')
  speed

  @type([Hex])
  path = new ArraySchema<Hex>()

  constructor({ id, x, y, gridX, gridY, team, health, damage, speed }) {
    super()

    this.id = id
    this.gridX = gridX
    this.gridY = gridY
    this.team = team
    this.health = health
    this.damage = damage
    this.speed = speed
    this.x = x
    this.y = y
  }
}
