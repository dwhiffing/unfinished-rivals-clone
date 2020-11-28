import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Player } from './Player'
import { Unit } from './Unit'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()
  @type([Unit])
  units = new ArraySchema<Unit>()
  constructor() {
    super()
    this.units.push(new Unit(0, 0))
  }
}
