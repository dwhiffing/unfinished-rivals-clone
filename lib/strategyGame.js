import { defineGrid, extendHex } from 'honeycomb-grid'
import { uniqBy } from 'lodash'
import * as constants from './constants'

let unitId = 0
const UNIT = { speed: 40, path: [], health: 100, damage: 10 }

export class StrategyGame {
  constructor(
    clientWidth = constants.NATIVE_WIDTH,
    clientHeight = constants.NATIVE_HEIGHT,
  ) {
    const size = clientWidth / (constants.WIDTH * constants.HEX_WIDTH_RATIO)
    const TILE_HEIGHT = size * constants.HEX_HEIGHT_RATIO
    this.SCALE = clientWidth / 1280
    this.OFFSET_Y = (clientHeight - TILE_HEIGHT * constants.HEIGHT) / 2
    this.HEX_CONFIG = { size, index: 0, unit: null }
    this.SCALED_SIZE = size / constants.ABSOLUTE_TILE_SIZE
    this.SCALED_WIDTH = (constants.HEX_SPRITE_WIDTH * this.SCALED_SIZE) / 2
    this.SCALED_HEIGHT = (constants.HEX_SPRITE_HEIGHT * this.SCALED_SIZE) / 2
    this.NATIVE_WIDTH = constants.NATIVE_WIDTH
    this.NATIVE_HEIGHT = constants.NATIVE_HEIGHT

    this.phaseIndex = -1
    this.chargeIndex = -1
    this.charge = 0
    this.pads = []
    this.players = []
  }

  createGrid = (renderObject) => {
    this.Hex = extendHex(this.HEX_CONFIG)
    this.ExtendedHexGrid = defineGrid(this.Hex)
    const onCreate = (hex) => {
      hex.index = this.getMapValue(hex)
      hex.object = renderObject ? renderObject(hex) : null
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
    // TODO:  store destination hex on unit
    // whenever a unit enters a new tile, check if the next tile is occupied
    // if it is, abandon the path

    this.units.forEach(this._attackTarget)
    this.units.forEach(this._moveTowardDestination)
    this.pads = this._getPads()
    this.chargeIndex = this._getChargeIndex()
    this.charge = this._getCharge()
  }

  moveUnit = ({ unitId, x, y }) => {
    const unit = this.getUnit(unitId)
    const start = this.getHex({ x: unit.gridX, y: unit.gridY })
    const end = this.getHex({ x, y })
    unit.path = this.getPath(unit, start, end)
  }

  clientSyncState = (state) => {
    this.units = state.units
    this.pads = state.pads
    this.charge = state.charge
    this.chargeIndex = state.chargeIndex
    this.phaseIndex = state.phaseIndex

    state.hexes.forEach((hex) => this.getHex(hex).object.setIndex(hex.index))

    state.pads.forEach((pad) =>
      pad.hexes.forEach((hex) => this.getHex(hex).object.setStatus(pad.status)),
    )
  }

  getNewUnit = (unit) => {
    const id = ++unitId
    const coords = this.getScreenFromHex({ x: unit.gridX, y: unit.gridY })
    const hex = this.getHex({ x: unit.gridX, y: unit.gridY })
    const _unit = { id, hex, ...UNIT, ...unit, ...coords }
    hex.unit = _unit
    return _unit
  }

  getHex = ({ x, y }) => this.hexes.get({ x, y })

  getUnit = (id) => this.units.find((u) => u.id === id)

  getScreenFromHex = (hex) => {
    const coords = hex.toPoint ? hex.toPoint() : this.getHex(hex).toPoint()
    return {
      x: coords.x + this.SCALED_WIDTH,
      y: coords.y + this.SCALED_HEIGHT + this.OFFSET_Y,
    }
  }

  getHexFromScreen = ({ x, y }) =>
    this.getHex(this.ExtendedHexGrid.pointToHex(x, y - this.OFFSET_Y))

  getMapValue = (hex) => {
    const coord = constants.MAP.find(([x, y]) => hex.x === x && hex.y === y)
    return coord ? coord[2] : 0
  }

  canMoveUnit = ({ playerId, unitId, x, y }) => {
    const unit = this.getUnit(unitId)
    const player = this.players.find((p) => p.id === playerId)
    const hex = this.getHex({ x, y })
    return (
      player &&
      unit &&
      unit.team === player.team &&
      hex.index !== 1 &&
      !hex.unit
    )
  }

  hexesBetween(start, end) {
    const distance = start.distance(end)
    const step = 1.0 / Math.max(distance, 1)
    const l = 0.2
    const b = -0.4

    const nudgel = (h) => this.Hex({ ...h, q: h.q + l, r: h.r + l, s: h.s + b })
    const nudger = (h) => this.Hex({ ...h, q: h.q + l, r: h.r + b, s: h.s + l })
    const nudgez = (h) => this.Hex({ ...h, q: h.q + b, r: h.r + l, s: h.s + l })

    let hexes = []
    for (let i = 0; i <= distance; i++) {
      const _i = step * i
      hexes.push(
        this.hexes.get(start.lerp(end, _i).round()),
        this.hexes.get(nudgez(start).lerp(nudgez(end), _i).round()),
        this.hexes.get(nudgel(start).lerp(nudgel(end), _i).round()),
        this.hexes.get(nudger(start).lerp(nudger(end), _i).round()),
      )
    }

    return uniqBy(hexes, (h) => h.toString()).filter((h) => h !== start)
    // .filter(this.isEmpty)
  }

  isEmpty = (h) => !h.unit && h.index !== 1

  getPath = (unit, start, end) => {
    // if we can reach the destination directly from start, just return the end hex
    if (this.hexesBetween(start, end).every(this.isEmpty)) return [end]

    let frontier = [start]
    let came_from = { [start.toString()]: null }

    const unitHexes = this.units.map((u) => ({
      unit: u,
      hex: this.getHex({ x: u.gridX, y: u.gridY }),
    }))
    const getUnitForHex = (h) => {
      const uh = unitHexes.find((uh) => uh.hex === h)
      if (uh) return uh.unit
    }

    const openTiles = [...this.hexes].filter((h) => {
      const unitOnHex = getUnitForHex(h)
      return (
        !!h &&
        h.index !== 1 &&
        (!unitOnHex || unitOnHex.team === unit.team) &&
        h !== start
      )
    })
    let canSeeEnd = {}
    openTiles.forEach((h) => {
      canSeeEnd[h.toString()] = this.hexesBetween(h, end).every(this.isEmpty)
    })

    const getDistance = (a, b) => {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
    }

    while (frontier.length > 0) {
      let current = frontier.shift()
      const getScore = (h) => {
        const hCanSeeEnd = canSeeEnd[h.toString()]
        return (
          getDistance(h, end) +
          getDistance(h, current) * 1.3 +
          (hCanSeeEnd ? 0 : 0.1)
        )
      }
      const sorter = (a, b) => getScore(a) - getScore(b)
      if (current === end) break
      let neighbours = openTiles
        .filter(
          (h) =>
            this.hexesBetween(current, h).every(this.isEmpty) &&
            !came_from[h.toString()],
        )
        .sort(sorter)

      neighbours.forEach((next) => {
        if (!came_from[next.toString()]) {
          frontier.push(next)
          frontier = frontier.sort(sorter)
          came_from[next.toString()] = current
        }
      })
    }

    let current = getUnitForHex(end) ? start : end
    let path = []
    while (current !== start) {
      path.push(current)
      if (came_from[current.toString()]) {
        current = came_from[current.toString()]
      } else {
        break
      }
    }
    path.reverse()
    return path
  }

  _attackTarget = (unit) => {
    if (unit.path.length > 0 || !unit.hex) return

    const neighbours = this.hexes
      .neighborsOf(unit.hex)
      .filter((h) => h && h.unit && h.unit.team !== unit.team)
    if (neighbours.length === 0) return

    const target = this.getUnit(neighbours[0].unit.id)
    target.health -= unit.damage
    if (target.health > 0) return

    target.health = 0
    neighbours[0].unit = null
    target.hex = null
  }

  _moveTowardDestination = (unit) => {
    if (unit.path.length === 0) return

    const current = unit.path[0]
    const { x, y } = this.getScreenFromHex(current)
    if (unit.x === x && unit.y === y) return

    const currentHex = this.getHexFromScreen({ x: unit.x, y: unit.y })
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

  _aStar = (unit, start, end) => {
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
