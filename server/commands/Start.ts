import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { rivals } from '../../lib/rivals'
import { Hex } from '../schema/Hex'
import { Unit } from '../schema/Unit'

export class StartCommand extends Command<RoomState> {
  validate() {
    return true
  }

  execute() {
    rivals.createGrid()
    this.state.grid = this.state.grid.concat(
      rivals.hexGrid.map((h) => new Hex(h.x, h.y, h.index)),
    )
    this.state.units.push(new Unit(2, 2, 0))
    this.state.units.push(new Unit(2, 1, 0))
    this.state.units.push(new Unit(1, 3, 0))
    this.state.units.push(new Unit(8, 1, 1))
    this.state.units.push(new Unit(9, 2, 1))
    this.state.units.push(new Unit(9, 3, 1))
    this.state.phaseIndex = 0
  }
}
