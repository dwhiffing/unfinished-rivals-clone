import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'

export class TickCommand extends Command<RoomState> {
  execute() {
    if (this.state.phaseIndex === -1) return
    if (this.state.phaseIndex === 1) {
      if (this.state.counter === -1) this.state.counter = 20
      this.state.counter -= 1

      // TODO: fix indexOf bug after this disconnect is triggered sometimes

      if (this.state.counter < 1) {
        this.state.phaseIndex = 2
        if (this.room) {
          this.room.disconnect()
          this.room = null
        }
      }

      return []
    }
    if (this.state.phaseIndex === 0) this.state.strategyGame.tick()

    return [new SyncCommand()]
  }
}
