import { Command } from '@colyseus/command'
import { RoomState } from '../schema'

export class MoveCommand extends Command<
  RoomState,
  { unitId: string; x: number; y: number }
> {
  validate({ unitId, x, y }) {
    return true
  }

  execute({ unitId, x, y }) {
    const unit = this.state.units.find((u) => u.id === unitId)
    if (!unit) return

    unit.destinationX = x
    unit.destinationY = y
  }
}
