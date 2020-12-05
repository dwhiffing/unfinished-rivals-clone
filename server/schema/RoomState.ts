import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Player } from './Player'
import { Unit } from './Unit'
import { Hex } from './Hex'
import { Pad } from './Pad'
import { StrategyGame } from '../../lib/strategyGame'

export class RoomState extends Schema {
  strategyGame

  @type([Player])
  players = new ArraySchema<Player>()

  @type('number')
  phaseIndex = -1

  @type('number')
  chargeIndex = -1

  @type('number')
  counter = -1

  @type('number')
  charge = 0

  @type([Pad])
  pads = new ArraySchema<Pad>()

  @type([Unit])
  units = new ArraySchema<Unit>()

  @type([Hex])
  hexes

  constructor() {
    super()
    this.strategyGame = new StrategyGame()
    this.strategyGame.init()
  }
}
