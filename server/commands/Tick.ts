import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { rivals } from '../../lib/rivals'
export class TickCommand extends Command<RoomState> {
  validate() {
    return true
  }

  execute() {
    this.state.units.forEach((unit) => {
      if (unit.path.length === 0) return

      const current = unit.path[0]
      const { x, y } = rivals.getScreenPosFromCoords(current.x, current.y)
      if (unit.x === x && unit.y === y) return

      const currentHex = rivals.getHexFromScreenPos({ x: unit.x, y: unit.y })
      if (unit.gridX !== currentHex.x || unit.gridY !== currentHex.y) {
        if (unit.hex) {
          unit.hex.unit = null
        }
        unit.gridX = currentHex.x
        unit.gridY = currentHex.y
        unit.hex = currentHex
        currentHex.unit = unit
      }

      const xDist = x - unit.x
      const yDist = y - unit.y
      const distance = Math.sqrt(xDist * xDist + yDist * yDist)
      if (distance > unit.speed) {
        const angle = Math.atan2(yDist, xDist)
        unit.x += unit.speed * Math.cos(angle)
        unit.y += unit.speed * Math.sin(angle)
      } else {
        unit.x = x
        unit.y = y
        unit.path.shift()
      }
    })
  }
}
