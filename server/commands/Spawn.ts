import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { SyncCommand } from './Sync'
import { UNIT_COST } from '../../lib/strategyGame'

export class SpawnCommand extends Command<RoomState, { playerId: string }> {
  validate({ playerId }) {
    const player = this.state.players.find((p) => p.id === playerId)
    return player.money >= UNIT_COST
  }

  execute({ playerId }) {
    this.state.strategyGame.spawn({ playerId })
    return [new SyncCommand()]
  }
}
