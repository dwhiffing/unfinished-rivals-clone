import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'

export class MoveCommand extends Command<
  RoomState,
  { playerId: string; unitId: number; x: number; y: number }
> {
  validate(opts) {
    return this.state.strategyGame.unitManager.canMoveUnit(opts)
  }

  execute({ unitId, x, y }) {
    this.state.strategyGame.unitManager.moveUnit({ unitId, x, y })
    return [new SyncCommand()]
  }
}
