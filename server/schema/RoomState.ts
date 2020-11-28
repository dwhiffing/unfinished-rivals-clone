import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Player } from './Player'
import { Unit } from './Unit'
import { Hex } from './Hex'
import { rivals } from '../../lib/rivals'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  @type('number')
  phaseIndex = -1

  @type('number')
  chargeIndex = -1

  @type('number')
  charge = 0

  @type([Unit])
  units = new ArraySchema<Unit>()

  @type([Hex])
  grid = new ArraySchema<Hex>()

  constructor() {
    super()
  }
}
