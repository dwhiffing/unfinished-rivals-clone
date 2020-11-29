import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'

export class StartCommand extends Command<RoomState> {
  execute() {
    this.state.strategyGame.start()

    return [new SyncCommand()]
  }
}
