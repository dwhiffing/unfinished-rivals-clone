import { Command } from '@colyseus/command'
import { Player, RoomState } from '../schema'

export class MoveCommand extends Command<RoomState, { playerId: string }> {
  validate({ playerId, name }) {
    return true
  }

  execute({ playerId, x, y }) {
    this.state.units[0].x = x
    this.state.units[0].y = y
  }
}
