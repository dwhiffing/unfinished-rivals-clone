import { Command } from '@colyseus/command'
import { Player, RoomState } from '../schema'
import { StartCommand } from './Start'

export class JoinCommand extends Command<RoomState, { playerId: string }> {
  validate({ playerId, name }) {
    return true
  }

  execute({ playerId, name }) {
    const player = new Player(playerId)
    player.name = name
    player.team = this.state.players.some((p) => p.team === 0) ? 1 : 0
    this.state.players.push(player)

    if (this.state.players.length === 2) {
      return [new StartCommand()]
    }
  }
}
