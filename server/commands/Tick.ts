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
      const currentHex = rivals.getHexFromScreenPos({ x: unit.x, y: unit.y })
      unit.gridX = currentHex.x
      unit.gridY = currentHex.y
      if (unit.x > destination.x) {
        unit.x -= unit.speed
      }
      if (unit.x < destination.x) {
        unit.x += unit.speed
      }
      if (unit.y > destination.y) {
        unit.y -= unit.speed
      }
      if (unit.y < destination.y) {
        unit.y += unit.speed
      }
    })
  }
}
