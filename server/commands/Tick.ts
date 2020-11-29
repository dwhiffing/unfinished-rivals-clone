import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'

export class TickCommand extends Command<RoomState> {
  execute() {
    if (this.state.phaseIndex === -1) return
    if (this.state.phaseIndex === 1) return this.room.disconnect()
    if (this.state.phaseIndex === 0) this.state.strategyGame.tick()

    return [new SyncCommand()]
  }
}
