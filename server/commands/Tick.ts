import { Command } from '@colyseus/command'
import { RoomState } from '../schema'
import { rivals } from '../../lib/rivals'
export class TickCommand extends Command<RoomState> {
  validate() {
    return true
  }

  execute() {
    this.state.units.forEach((unit) => {
      const destination = rivals.getScreenPosFromCoords(
        unit.destinationX,
        unit.destinationY,
      )
      if (unit.x === destination.x && unit.y === destination.y) return
      const currentHex = rivals.getHexFromScreenPos({ x: unit.x, y: unit.y })
      unit.gridX = currentHex.x
      unit.gridY = currentHex.y

      const xDist = destination.x - unit.x
      const yDist = destination.y - unit.y
      const distance = Math.sqrt(xDist * xDist + yDist * yDist)
      if (distance > unit.speed) {
        const angle = Math.atan2(yDist, xDist)
        unit.x += unit.speed * Math.cos(angle)
        unit.y += unit.speed * Math.sin(angle)
      } else {
        unit.x = destination.x
        unit.y = destination.y
      }
    })
  }
}
