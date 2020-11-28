import { type, Schema } from '@colyseus/schema'
import { rivals } from '../../lib/rivals'

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
  destinationX

  @type('number')
  destinationY

  @type('number')
  speed

  constructor(x: number, y: number) {
    super()

    this.id = +new Date()
    this.gridX = x
    this.gridY = y
    this.destinationX = x
    this.destinationY = y
    this.speed = 20
    const screen = rivals.getScreenPosFromCoords(this.gridX, this.gridY)
    this.x = screen.x
    this.y = screen.y
  }
}
