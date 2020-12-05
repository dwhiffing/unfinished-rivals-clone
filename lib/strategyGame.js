import * as constants from './constants'
import { Hexes } from './hexes'
let unitId = 0
const UNIT = { speed: 10, path: [], health: 100, damage: 1 }

export class StrategyGame {
  constructor(
    clientWidth = constants.NATIVE_WIDTH,
    clientHeight = constants.NATIVE_HEIGHT,
  ) {
    this.tileSize =
      clientWidth / ((constants.WIDTH - 1.2) * constants.HEX_WIDTH_RATIO)
    const TILE_HEIGHT = this.tileSize * constants.HEX_HEIGHT_RATIO
    this.SCALE = clientWidth / 1280
    this.OFFSET_X = -this.tileSize
    this.OFFSET_Y = (clientHeight - TILE_HEIGHT * constants.HEIGHT) / 2
    this.SCALED_SIZE = this.tileSize / constants.ABSOLUTE_TILE_SIZE
    this.SCALED_WIDTH = (constants.HEX_SPRITE_WIDTH * this.SCALED_SIZE) / 2
    this.SCALED_HEIGHT = (constants.HEX_SPRITE_HEIGHT * this.SCALED_SIZE) / 2
    this.NATIVE_WIDTH = constants.NATIVE_WIDTH
    this.NATIVE_HEIGHT = constants.NATIVE_HEIGHT

    this.phaseIndex = -1
    this.chargeIndex = -1
    this.charge = 0
    this.pads = []
    this.players = []
    this.hexes = new Hexes(this)
    this.getHexFromScreen = this.hexes.getHexFromScreen
    this.getScreenFromHex = this.hexes.getScreenFromHex
    this.getPath = this.hexes.getPath
    this.isOccupied = this.hexes.isOccupied
  }

  init(renderHexObject) {
    this.hexes.createGrid(renderHexObject)
  }

  addPlayer = ({ id, name }) => {
    const team = this.players.some((p) => p.team === 0) ? 1 : 0
    this.players.push({ id, name, team })
  }

  removePlayer = (id) => {
    this.players = this.players.filter((p) => p.id !== id)
    this.phaseIndex = 1
  }

  start = () => {
    this.units = constants.UNITS.map(this.getNewUnit)
    this.phaseIndex = 0
  }

  tick = () => {
    if (this.phaseIndex === -1) return
    this.units.forEach(this._attackTarget)
    this.units.forEach(this._moveTowardDestination)
    this.units = this.units.filter((u) => u.health > 0)
    this.pads = this.hexes._getPads()
    this.chargeIndex = this._getChargeIndex()
    this.charge = this._getCharge()
  }

  canMoveUnit = ({ playerId, unitId, x, y }) => {
    const unit = this.getUnit(unitId)
    const player = this.players.find((p) => p.id === playerId)
    const hex = this.hexes.get({ x, y })
    return (
      player &&
      unit &&
      unit.team === player.team &&
      !this.hexes.isOccupied(hex, unit)
    )
  }

  moveUnit = ({ unitId, x, y }) => {
    const unit = this.getUnit(unitId)
    const start = this.hexes.get({ x: unit.gridX, y: unit.gridY })
    const end = this.hexes.get({ x, y })
    this.units = this.units.map((u) => {
      if (u.id === unitId)
        return {
          ...u,
          path: this.getPath(unit, start, end),
          destination: { x, y },
        }
      return u
    })
  }

  clientSyncState = (state) => {
    this.units = state.units
    this.pads = state.pads
    this.charge = state.charge
    this.chargeIndex = state.chargeIndex
    this.phaseIndex = state.phaseIndex

    state.hexes.forEach((h) => {
      const hex = this.hexes.get(h)
      hex.object.setIndex(hex.index)
      hex.unit = this.getUnitForHex(hex)
    })

    state.pads.forEach((pad) =>
      pad.hexes.forEach((hex) =>
        this.hexes.get(hex).object.setStatus(pad.status),
      ),
    )
  }

  getNewUnit = (unit) => {
    const id = ++unitId
    const coords = this.getScreenFromHex({ x: unit.gridX, y: unit.gridY })
    const hex = this.hexes.get({ x: unit.gridX, y: unit.gridY })
    const _unit = { id, hex, ...UNIT, ...unit, ...coords }
    hex.unit = _unit
    return _unit
  }

  getUnit = (id) => this.units.find((u) => u.id === id)

  getUnitForHex = ({ x, y }) =>
    this.units.find((u) => u.gridX === x && u.gridY === y)

  _attackTarget = (unit) => {
    if (unit.path.length > 0 || !unit.hex) return

    const target = this.hexes.hexGrid.neighborsOf(unit.hex).find((h) => {
      if (!h) return false
      const _unit = this.getUnitForHex(h)
      h.unit = _unit
      return h && _unit && _unit.team !== unit.team
    })
    if (!target) return

    const targetUnit = target.unit
    targetUnit.health -= unit.damage
    if (targetUnit.health > 0) return

    targetUnit.health = 0
    targetUnit.hex = null
    target.unit = null
  }

  _moveTowardDestination = (unit) => {
    const currentHex = this.hexes.getHexFromScreen({ x: unit.x, y: unit.y })

    // Unit has reached destination
    if (unit.path.length === 0) {
      unit.destination = null
      return
    }

    // Unit needs to move for other unit
    if (
      currentHex.unit &&
      unit.id !== currentHex.unit.id &&
      unit.destination &&
      unit.team !== currentHex.unit.team
    ) {
      unit.path = this.hexes.getPath(
        unit,
        unit.hex,
        this.hexes.getNearestNeighbour(currentHex, unit),
      )
    }

    const currentDestination = unit.path[0]
    const { x, y } = this.hexes.getScreenFromHex(currentDestination)
    if (
      Math.round(unit.x) === Math.round(x) &&
      Math.round(unit.y) === Math.round(y)
    ) {
      unit.path.shift()
      return
    }

    const last = unit.path[unit.path.length - 1]
    unit.destination = { x: last.x, y: last.y }

    // when unit enters new hex
    if (unit.gridX !== currentHex.x || unit.gridY !== currentHex.y) {
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

  _getChargeIndex = () => {
    const leftCount = this.pads.filter((p) => p.status === 0).length
    const rightCount = this.pads.filter((p) => p.status === 1).length
    const tieCount = this.pads.filter((p) => p.status === 2).length
    if (
      (leftCount > 0 && rightCount > 0 && rightCount === leftCount) ||
      (tieCount > leftCount && tieCount > rightCount)
    ) {
      return 2
    } else if (leftCount > rightCount) {
      return 0
    } else if (rightCount > leftCount) {
      return 1
    }
    return -1
  }

  _getCharge = () => {
    if (this.chargeIndex !== 0 && this.chargeIndex !== 1) return this.charge
    if (this.charge >= 100) this.phaseIndex = 1
    return this.charge + 1
  }
}
