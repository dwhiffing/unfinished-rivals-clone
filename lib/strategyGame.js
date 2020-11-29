import { defineGrid, extendHex } from 'honeycomb-grid'
import * as constants from './constants'

let unitId = 0
const UNIT = { speed: 20, path: [] }

// TODO: need to make game not fixed to specific resolution
// can likely have a true resolution and scale game based on width of client
// find ratio and multiply all screen positions to ratio

export class StrategyGame {
  constructor(clientWidth = 1280, clientHeight = 800) {
    const size = clientWidth / (constants.WIDTH * constants.HEX_WIDTH_RATIO)
    const TILE_HEIGHT = size * constants.HEX_HEIGHT_RATIO
    this.OFFSET_Y = (clientHeight - TILE_HEIGHT * constants.HEIGHT) / 2
    this.HEX_CONFIG = { size, index: 0, unit: null }
    this.SCALED_TILE_SIZE = size / constants.ABSOLUTE_TILE_SIZE

    this.phaseIndex = -1
    this.chargeIndex = -1
    this.charge = 0
    this.pads = []
    this.players = []
  }

  createGrid = (sceneRef, HexClass) => {
    this.ExtendedHexGrid = defineGrid(extendHex(this.HEX_CONFIG))
    const onCreate = (hex) => {
      hex.index = this.getMapValue(hex)
      hex.sprite = sceneRef && HexClass ? new HexClass(sceneRef, hex) : null
    }
    const { WIDTH: width, HEIGHT: height } = constants
    this.hexes = this.ExtendedHexGrid.rectangle({ width, height, onCreate })
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

    this.units.forEach(this._moveTowardDestination)
    this.pads = this._getPads()
    this.chargeIndex = this._getChargeIndex()
    this.charge = this._getCharge()
  }

  moveUnit = ({ unitId, x, y }) => {
    const unit = this.getUnit(unitId)
    const start = this.getHex({ x: unit.gridX, y: unit.gridY })
    const end = this.getHex({ x, y })
    unit.path = this._getPath(unit, start, end)
  }

  clientSyncState = (state) => {
    this.units = state.units
    this.pads = state.pads
    this.charge = state.charge
    this.chargeIndex = state.chargeIndex
    this.phaseIndex = state.phaseIndex

    if (!this.mapLoaded) {
      this.mapLoaded = true
      state.hexes.forEach((hex) => this.getHex(hex).sprite.setIndex(hex.index))
    }

    state.pads.forEach((pad) =>
      pad.hexes.forEach((hex) => this.getHex(hex).sprite.setStatus(pad.status)),
    )
  }

  getNewUnit = (unit) => {
    const id = ++unitId
    const coords = this.getScreenPosFromCoords({ x: unit.gridX, y: unit.gridY })
    return { id, ...UNIT, ...unit, ...coords }
  }

  getHex = ({ x, y }) => this.hexes.get({ x, y })

  getUnit = (id) => this.units.find((u) => u.id === id)

  getScreenPos = ({ x, y }) => ({
    x: x + (constants.HEX_SPRITE_WIDTH * this.SCALED_TILE_SIZE) / 2,
    y:
      y +
      (constants.HEX_SPRITE_HEIGHT * this.SCALED_TILE_SIZE) / 2 +
      this.OFFSET_Y,
  })

  getScreenPosFromCoords = ({ x, y }) =>
    this.getScreenPos(this.getHex({ x, y }).toPoint())

  getHexFromScreenPos = ({ x, y }) =>
    this.getHex(this.ExtendedHexGrid.pointToHex(x, y - this.OFFSET_Y))

  getMapValue = (hex) => {
    const coord = constants.MAP.find(([x, y]) => hex.x === x && hex.y === y)
    return coord ? coord[2] : 0
  }

  canMoveUnit = ({ playerId, unitId, x, y }) => {
    const unit = this.getUnit(unitId)
    const player = this.players.find((p) => p.id === playerId)
    const hex = this.getHex({ x, y })
    return unit && unit.team === player.team && hex.index !== 1 && !hex.unit
  }

  _moveTowardDestination = (unit) => {
    if (unit.path.length === 0) return

    const current = unit.path[0]
    const { x, y } = this.getScreenPosFromCoords(current)
    if (unit.x === x && unit.y === y) return

    const currentHex = this.getHexFromScreenPos({ x: unit.x, y: unit.y })
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

  _getPads = () => {
    let pads = []
    this.hexes
      .filter((h) => h.index === 3)
      .forEach((hex) => {
        const neighbours = this.hexes.neighborsOf(hex)
        const connectedPad = pads.find((pad) =>
          pad.some((h) => neighbours.includes(h)),
        )
        if (connectedPad) {
          connectedPad.push(hex)
        } else {
          pads.push([hex])
        }
      })

    return pads.map((hexes) => {
      let status = -1
      let leftIsPresent = hexes.some((h) => h.unit && h.unit.team === 0)
      let rightIsPresent = hexes.some((h) => h.unit && h.unit.team === 1)
      if (leftIsPresent) status = 0
      if (rightIsPresent) status = 1
      if (leftIsPresent && rightIsPresent) status = 2
      return { status, hexes }
    })
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

  // TODO: this should try to go toward the destination in a straight line as much as possible
  _getPath = (unit, start, end) => {
    this.hexes.forEach((h) => (h.parent = null))
    let candidates = [start]
    let explored = []
    let i = 500
    while (candidates.length > 0 && i-- > 0) {
      candidates = candidates.sort((a, b) => {
        const g1 = a.distance(start)
        const h1 = a.distance(end)
        const f1 = g1 + h1
        const g2 = b.distance(start)
        const h2 = b.distance(end)
        const f2 = g2 + h2
        return f1 == f2 ? h1 - h2 : f1 - f2
      })
      let current = candidates.shift()

      explored.push(current)
      if (current === end) {
        candidates = []
        continue
      }

      const neighbours = this.hexes
        .neighborsOf(current)
        .filter(
          (h) =>
            !!h &&
            !candidates.includes(h) &&
            !explored.includes(h) &&
            h.index !== 1 &&
            (!h.unit || h.unit.team === unit.team),
        )
      neighbours.forEach((h) => (h.parent = current))
      candidates = [...candidates, ...neighbours]
    }

    let path = []

    let next = explored[explored.length - 1]
    do {
      path.unshift(next)
      next = next.parent
    } while (next && next.parent)

    return path
  }
}
