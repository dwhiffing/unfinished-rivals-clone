import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'

export class SpawnCommand extends Command<RoomState, { playerId: string }> {
  validate({ playerId }) {
    return true
  }

  execute({ playerId }) {
    this.state.strategyGame.spawn({ playerId })
    return [new SyncCommand()]
  }
}
