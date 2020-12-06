import * as constants from './constants'
let unitId = 0
const UNIT = { speed: 10, path: [], health: 100, damage: 1 }
const UNIT_CAP = 6
export const UNIT_COST = 10

// TODO: add different unit stats and add types
// TODO: add harvester

export class UnitManager {
  constructor(strategyGame) {
    this.strategyGame = strategyGame
    this.units = []
  }

  tick = () => {
    if (this.strategyGame.phaseIndex !== 0) return

    this.units.forEach(this._attackTarget)
    this.units.forEach(this._moveTowardDestination)
    this.units = this.units.filter((u) => u.health > 0)
  }

  spawn = ({ playerId }) => {
    const player = this.strategyGame.players.find((p) => p.id === playerId)
    const playerUnitCount = this.units.filter((u) => u.team === player.team)
      .length
    const hex = constants.UNITS.find((coords) => {
      const targetHex = this.strategyGame.hexes.getHex({
        x: coords.gridX,
        y: coords.gridY,
      })
      return coords.team === player.team && !targetHex.unit
    })
    if (hex && playerUnitCount < UNIT_CAP) {
      player.money -= UNIT_COST
      this.units = [...this.units, this._getNewUnit(hex)]
    }
  }

  moveUnit = ({ unitId, x, y }) => {
    const unit = this._getUnit(unitId)
    const start = this.strategyGame.hexes.getHex({
      x: unit.gridX,
      y: unit.gridY,
    })
    const end = this.strategyGame.hexes.getHex({ x, y })
    this.units = this.units.map((u) => {
      if (u.id === unitId)
        return {
          ...u,
          path: this.strategyGame.hexes.getPath(unit, start, end),
          destination: { x, y },
        }
      return u
    })
  }

  canMoveUnit = ({ playerId, unitId, x, y }) => {
    const unit = this._getUnit(unitId)
    const player = this.strategyGame.players.find((p) => p.id === playerId)
    const hex = this.strategyGame.hexes.getHex({ x, y })
    return (
      unit?.team === player?.team &&
      !this.strategyGame.hexes.isOccupied(hex, unit)
    )
  }

  getUnitForHex = ({ x, y }) =>
    this.units.find((u) => u.gridX === x && u.gridY === y)

  _getNewUnit = (unit) => {
    const id = ++unitId
    const coords = this.strategyGame.hexes.getScreenFromHex({
      x: unit.gridX,
      y: unit.gridY,
    })
    const hex = this.strategyGame.hexes.getHex({ x: unit.gridX, y: unit.gridY })
    const _unit = { id, hex, ...UNIT, ...unit, ...coords }
    hex.unit = _unit
    return _unit
  }

  _getUnit = (id) => this.units.find((u) => u.id === id)

  _attackTarget = (unit) => {
    if (unit.path.length > 0 || !unit.hex) return

    const target = this.strategyGame.hexes.hexGrid
      .neighborsOf(unit.hex)
      .find((h) => h && h.unit && h.unit.team !== unit?.team)
    if (!target) return

    target.unit.health -= unit.damage
    if (target.unit.health > 0) return

    target.unit.health = 0
    target.unit.hex = null
    target.unit = null
  }

  _moveTowardDestination = (unit) => {
    if (unit.path.length === 0) {
      unit.destination = null
      return
    }

    const nextHex = unit.path[0]
    const currentHex = this.strategyGame.hexes.getHexFromScreen(unit)
    const { x, y } = this.strategyGame.hexes.getScreenFromHex(nextHex)

    // Unit has reached destination
    if (
      Math.round(unit.x) === Math.round(x) &&
      Math.round(unit.y) === Math.round(y)
    ) {
      return unit.path.shift()
    }

    const last = unit.path[unit.path.length - 1]
    unit.destination = { x: last.x, y: last.y }

    // when unit enters new hex
    if (unit.gridX !== currentHex.x || unit.gridY !== currentHex.y) {
      // if hex is occupied, move back to last hex
      const unitInNextHex = this.getUnitForHex(nextHex)
      if (unitInNextHex && unitInNextHex.id !== unit.id) {
        unit.path = [{ x: unit.gridX, y: unit.gridY }]
        return
      }

      if (unit.hex) unit.hex.unit = null
      if (!currentHex.unit) currentHex.unit = unit
      unit.hex = currentHex
      unit.gridX = currentHex.x
      unit.gridY = currentHex.y
    }

    // move unit toward point
    const xDist = x - unit.x
    const yDist = y - unit.y
    const distance = Math.sqrt(xDist * xDist + yDist * yDist)
    if (distance > unit.speed * 1.5) {
      const angle = Math.atan2(yDist, xDist)
      unit.x += unit.speed * Math.cos(angle)
      unit.y += unit.speed * Math.sin(angle)
    } else {
      unit.x = x
      unit.y = y
      unit.path.shift()
    }
  }
}
