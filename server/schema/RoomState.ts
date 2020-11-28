import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Player } from './Player'
import { Unit } from './Unit'
import { Hex } from './Hex'

export class PadStatus extends Schema {
  @type('number')
  status = -1

  @type([Hex])
  hexes = new ArraySchema<Hex>()

  constructor(status, hexes) {
    super()
    this.status = status
    this.hexes = hexes
  }
}

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  @type('number')
  phaseIndex = -1

  @type('number')
  chargeIndex = -1

  @type('number')
  charge = 0

  @type([PadStatus])
  padStatus = new ArraySchema<PadStatus>()

  @type([Unit])
  units = new ArraySchema<Unit>()

  @type([Hex])
  grid = new ArraySchema<Hex>()

  constructor() {
    super()
  }
}
