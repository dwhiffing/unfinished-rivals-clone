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
    this.state.units[0].destinationX = x
    this.state.units[0].destinationY = y
  }
}
