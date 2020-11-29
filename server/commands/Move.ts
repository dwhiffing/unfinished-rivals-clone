import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'

export class MoveCommand extends Command<
  RoomState,
  { playerId: string; unitId: number; x: number; y: number }
> {
  validate({ playerId, unitId, x, y }) {
    return this.state.strategyGame.canMoveUnit({ playerId, unitId, x, y })
  }

  execute({ unitId, x, y }) {
    this.state.strategyGame.moveUnit({ unitId, x, y })
    return [new SyncCommand()]
  }
}
