import { ArraySchema } from '@colyseus/schema'
import { Command } from '@colyseus/command'
import { rivals } from '../../lib/rivals'
import { RoomState } from '../schema'
import { Hex } from '../schema/Hex'

export class MoveCommand extends Command<
  RoomState,
  { playerId: string; unitId: number; x: number; y: number }
> {
  validate({ playerId, unitId, x, y }) {
    const unit = this.state.units.find((u) => u.id === unitId)
    const player = this.state.players.find((p) => p.id === playerId)
    const hex = rivals.hexGrid.get({ x, y })
    return unit && unit.team === player.team && hex.index !== 1 && !hex.unit
  }

  execute({ unitId, x, y }) {
    const unit = this.state.units.find((u) => u.id === unitId)
    const start = rivals.hexGrid.get({ x: unit.gridX, y: unit.gridY })
    const end = rivals.hexGrid.get({ x, y })
    const path = rivals.getPath(unit, start, end)
    unit.path = new ArraySchema<Hex>()
    unit.path.push(...path.map((h) => new Hex(h.x, h.y, 0)))
  }
}
