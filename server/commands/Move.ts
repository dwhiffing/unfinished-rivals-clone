import { Command } from '@colyseus/command'
import { rivals } from '../../lib/rivals'
import { RoomState } from '../schema'

export class MoveCommand extends Command<
  RoomState,
  { playerId: string; unitId: number; x: number; y: number }
> {
  validate({ playerId, unitId, x, y }) {
    const unit = this.state.units.find((u) => u.id === unitId)
    const player = this.state.players.find((p) => p.id === playerId)
    const hex = this.state.grid.find((g) => g.x === x && g.y === y)
    return unit && unit.team === player.team && hex.index === 0
  }

  execute({ unitId, x, y }) {
    const unit = this.state.units.find((u) => u.id === unitId)
    unit.destinationX = x
    unit.destinationY = y
  }
}
