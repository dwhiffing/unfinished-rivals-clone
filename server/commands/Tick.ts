import { ArraySchema } from '@colyseus/schema'
import { Command } from '@colyseus/command'
import { RoomState, PadStatus } from '../schema'
import { rivals } from '../../lib/rivals'
import { Hex } from '../schema/Hex'

export class TickCommand extends Command<RoomState> {
  validate() {
    return true
  }

  execute() {
    if (this.state.phaseIndex === -1) return

    this.state.units.forEach(moveTowardDestination)

    const padStatus = checkPads()
    const leftCount = padStatus.filter((p) => p.status === 0).length
    const rightCount = padStatus.filter((p) => p.status === 1).length
    this.state.padStatus = new ArraySchema<PadStatus>(...padStatus)

    this.state.chargeIndex = -1
    if (leftCount > 0 && rightCount > 0 && rightCount === leftCount) {
      this.state.chargeIndex = 2
    } else if (leftCount > rightCount) {
      this.state.chargeIndex = 0
      this.state.charge += 1
    } else if (rightCount > leftCount) {
      this.state.chargeIndex = 1
      this.state.charge += 1
    }

    if (this.state.charge >= 100) {
      this.state.phaseIndex = -1
      // TODO: announce winner via broadcast
      this.room.disconnect()
    }
  }
}

const checkPads = () => {
  if (!rivals.hexGrid) return []
  const padHexes = rivals.hexGrid.filter((h) => h.index === 3)
  let pads = []
  padHexes.forEach((hex) => {
    const neighbours = rivals.hexGrid.neighborsOf(hex)
    const connectedPad = pads.find((pad) =>
      pad.some((h) => neighbours.includes(h)),
    )
    if (connectedPad) {
      connectedPad.push(hex)
    } else {
      pads.push([hex])
    }
  })

  let padStatus = []
  pads.forEach((pad) => {
    let status = -1
    let leftIsPresent = pad.some((h) => h.unit && h.unit.team === 0)
    let rightIsPresent = pad.some((h) => h.unit && h.unit.team === 1)
    if (leftIsPresent) status = 0
    if (rightIsPresent) status = 1
    if (leftIsPresent && rightIsPresent) status = 2
    padStatus.push(
      new PadStatus(
        status,
        pad.map((h) => new Hex(h.x, h.y, h.index)),
      ),
    )
  })

  return padStatus
}

const moveTowardDestination = (unit) => {
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
}
