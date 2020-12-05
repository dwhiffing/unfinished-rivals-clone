import { defineGrid, extendHex } from 'honeycomb-grid'
import { pick, uniqBy } from 'lodash'
import * as constants from './constants'

export class Hexes {
  constructor(strategyGame) {
    this.strategyGame = strategyGame
  }

  createGrid = (renderObject) => {
    this.Hex = extendHex({
      size: this.strategyGame.tileSize,
      index: 0,
      unit: null,
    })
    this.ExtendedHexGrid = defineGrid(this.Hex)
    const onCreate = (hex) => {
      hex.index = this.getMapValue(hex)
      hex.object = renderObject ? renderObject(hex) : null
    }
    const { WIDTH: width, HEIGHT: height } = constants
    this.hexGrid = this.ExtendedHexGrid.rectangle({ width, height, onCreate })
    this.nudgeCache = {}
    this.hexCache = {}
  }

  toString = ({ x, y }) => `${x},${y}`

  get = (hexOrCoords) => {
    if (this.hexCache[this.toString(hexOrCoords)]) {
      return this.hexCache[this.toString(hexOrCoords)]
    }
    const result = this.hexGrid.get(hexOrCoords)
    if (result) this.hexCache[this.toString(result)] = result
    return result
  }

  getScreenFromHex = (hex) => {
    const coords = hex.toPoint ? hex.toPoint() : this.get(hex).toPoint()
    return {
      x: coords.x + this.strategyGame.SCALED_WIDTH + this.strategyGame.OFFSET_X,
      y:
        coords.y + this.strategyGame.SCALED_HEIGHT + this.strategyGame.OFFSET_Y,
    }
  }

  getHexFromScreen = ({ x, y }) =>
    this.get(
      this.ExtendedHexGrid.pointToHex(
        x - this.strategyGame.OFFSET_X,
        y - this.strategyGame.OFFSET_Y,
      ),
    )

  getMapValue = (hex) => {
    const coord = constants.MAP.find(([x, y]) => hex.x === x && hex.y === y)
    return coord ? coord[2] : 0
  }

  getNearestNeighbour = (hex, unit) =>
    this.hexGrid
      .neighborsOf(hex)
      .filter((h) => !this.isOccupied(h, unit))
      .sort((a, b) => this._getDistance(b) - this._getDistance(a))[0]

  _cubeToCartesian = ({ q, r }) => ({
    x: q + Math.floor(r / 2),
    y: r,
  })

  _nudge = (h) => {
    const l = 0.3
    const b = -0.6
    const picks = ['q', 'r']
    if (this.nudgeCache[h.toString()]) return this.nudgeCache[h.toString()]
    const result = {
      l: pick(this.Hex({ ...h, q: h.q + l, r: h.r + l, s: h.s + b }), picks),
      r: pick(this.Hex({ ...h, q: h.q + l, r: h.r + b, s: h.s + l }), picks),
      z: pick(this.Hex({ ...h, q: h.q + b, r: h.r + l, s: h.s + l }), picks),
    }
    this.nudgeCache[h.toString()] = result
    return result
  }

  _lerp = (a, b, i) => {
    //_lerp
    const q = a.q * (1 - i) + b.q * i
    const r = a.r * (1 - i) + b.r * i
    const s = -q - r
    // round
    let roundedQ = Math.round(q)
    let roundedR = Math.round(r)
    let roundedS = Math.round(s)
    const diffQ = Math.abs(q - roundedQ)
    const diffR = Math.abs(r - roundedR)
    const diffS = Math.abs(s - roundedS)

    if (diffQ > diffR && diffQ > diffS) {
      roundedQ = -roundedR - roundedS
    } else if (diffR > diffS) {
      roundedR = -roundedQ - roundedS
    }

    return this.get(this._cubeToCartesian({ q: roundedQ, r: roundedR }))
  }

  _hexesBetween(start, end) {
    const distance = start.distance(end)
    const step = 1.0 / Math.max(distance, 1)

    let hexes = []
    for (let i = 0; i <= distance; i++) {
      hexes.push(
        this._lerp(start, end, step * i),
        this._lerp(this._nudge(start).l, this._nudge(end).l, step * i),
        this._lerp(this._nudge(start).r, this._nudge(end).r, step * i),
        this._lerp(this._nudge(start).z, this._nudge(end).z, step * i),
      )
    }

    return uniqBy(hexes, (h) => h && h.toString()).filter((h) => h !== start)
  }

  isPassable = (team) => (h) => {
    if (!h) return false
    const unit = h.unit || this.strategyGame.getUnitForHex(h)
    return h.index !== 1 && h.index !== 4 && (!unit || unit.team === team)
  }

  isOccupied = (h, unit) => {
    if (!h) return true
    const unitOnHex = this.strategyGame.getUnitForHex(h)
    if (unitOnHex && unit && unit.id === unitOnHex.id) return false
    return (
      h.index === 1 ||
      h.index === 4 ||
      (unitOnHex &&
        unit &&
        (unitOnHex.team !== unit.team ||
          !unitOnHex.destination ||
          (unitOnHex.destination.x === h.x && unitOnHex.destination.y === h.y)))
    )
  }

  _canSeeHex = (a, b, team) =>
    this._hexesBetween(a, b).every(this.isPassable(team))

  _getDistance = (a, b) =>
    a && b ? Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) : 0

  getPath = (unit, start, end) => {
    // if there's a unit in the way, we can't get there
    if (this.isOccupied(end, unit)) return []

    // if we can reach the destination directly from start, just return the end hex
    if (this._canSeeHex(start, end, unit.team)) return [{ x: end.x, y: end.y }]

    // build graph of map
    let frontier = [start]
    let came_from = { [start.toString()]: null }
    const openHexes = [...this.hexGrid]
      .filter(this.isPassable(unit.team))
      .filter((h) => h !== start)
    openHexes.forEach((h) => {
      h.canSeeEnd = this._canSeeHex(h, end, unit.team)
    })

    while (frontier.length > 0) {
      const current = frontier.shift()
      if (current === end) break

      const getScore = (h) =>
        this._getDistance(h, end) +
        this._getDistance(h, current) * 1.3 +
        (h.canSeeEnd ? 0 : 0.1)

      openHexes
        .filter(
          (h) =>
            !came_from[h.toString()] && this._canSeeHex(current, h, unit.team),
        )
        .forEach((next) => {
          frontier.push(next)
          if (!came_from[next.toString()]) came_from[next.toString()] = current
        })
      frontier = frontier.sort((a, b) => getScore(a) - getScore(b))
    }

    // use came_from to build path by working backwards from end
    let current = end
    let path = []
    while (current !== start) {
      path.push({ x: current.x, y: current.y })
      current = came_from[current.toString()]
      if (!current) break
    }

    return path.reverse()
  }

  _getPads = () => {
    let pads = []
    this.hexGrid
      .filter((h) => h.index === 3)
      .forEach((hex) => {
        const neighbours = this.hexGrid.neighborsOf(hex)
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
}
