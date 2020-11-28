import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Player } from './Player'
import { Unit } from './Unit'
import { Hex } from './Hex'
import { rivals } from '../../lib/rivals'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  @type([Unit])
  units = new ArraySchema<Unit>()

  @type([Hex])
  grid = new ArraySchema<Hex>()

  constructor() {
    super()
    rivals.createGrid()
    this.grid = this.grid.concat(rivals.hexGrid.map((h) => new Hex(h.x, h.y)))
    this.units.push(new Unit(2, 1))
    this.units.push(new Unit(2, 2))
    this.units.push(new Unit(1, 3))
    this.units.push(new Unit(8, 1))
    this.units.push(new Unit(9, 2))
    this.units.push(new Unit(9, 3))
  }
}
