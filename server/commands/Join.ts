import { Command } from '@colyseus/command'
import { Player, RoomState } from '../schema'
import { StartCommand } from './Start'

export class JoinCommand extends Command<RoomState, { playerId: string }> {
  execute({ playerId, name }) {
    const player = new Player({ id: playerId, name })
    player.team = this.state.players.some((p) => p.team === 0) ? 1 : 0
    this.state.players.push(player)
    this.state.strategyGame.addPlayer({ id: playerId, name, ...player })

    if (this.state.phaseIndex === -1 && this.state.players.length === 2) {
      return [new StartCommand()]
    }
  }
}
