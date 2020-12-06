import { defineGrid, extendHex } from 'honeycomb-grid'
import { pick, uniqBy } from 'lodash'
import { lerp, distance } from './utils'
import * as constants from './constants'

// TODO: refactor
// TODO: resolve issues with occupied vs passable
// TODO: add different maps
// TODO: revert pathfinding to normal a* unless hex is in sight?

export class Hexes {
  constructor(strategyGame) {
    this.strategyGame = strategyGame
    this.offsetX = -constants.TILE_SIZE
    this.offsetY =
      (constants.HEIGHT - constants.TILE_HEIGHT * constants.GRID_HEIGHT) / 2.5
    this.scale = constants.TILE_SIZE / constants.ABSOLUTE_TILE_SIZE
    this.width = (constants.HEX_SPRITE_WIDTH * this.scale) / 2
    this.height = (constants.HEX_SPRITE_HEIGHT * this.scale) / 2
  }

  createGrid = (renderObject) => {
    this.Hex = extendHex({ size: constants.TILE_SIZE, index: 0, unit: null })
    this.ExtendedHexGrid = defineGrid(this.Hex)
    const onCreate = (hex) => {
      hex.index = this._getMapValue(hex)
      hex.object = renderObject ? renderObject(hex) : null
    }
    const { GRID_WIDTH: width, GRID_HEIGHT: height } = constants
    this.hexGrid = this.ExtendedHexGrid.rectangle({ width, height, onCreate })
    this.nudgeCache = {}
    this.hexCache = {}
  }

  getHex = (hexOrCoords) => {
    if (this.hexCache[this._toString(hexOrCoords)]) {
      return this.hexCache[this._toString(hexOrCoords)]
    }
    const result = this.hexGrid.get(hexOrCoords)
    if (result) this.hexCache[this._toString(result)] = result
    return result
  }

  getScreenFromHex = (hex) => {
    const coords = hex.toPoint ? hex.toPoint() : this.getHex(hex).toPoint()
    return {
      x: coords.x + this.width + this.offsetX,
      y: coords.y + this.height + this.offsetY,
    }
  }

  getHexFromScreen = ({ x, y }) =>
    this.getHex(
      this.ExtendedHexGrid.pointToHex(x - this.offsetX, y - this.offsetY),
    )

  getNearestNeighbour = (hex, unit) =>
    this.hexGrid
      .neighborsOf(hex)
      .filter((h) => !this.isOccupied(h, unit))
      .sort((a, b) => distance(b) - distance(a))[0]

  isOccupied = (h, unit) => {
    if (!h) return true
    const unitOnHex = this.strategyGame.unitManager.getUnitForHex(h)
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

  getPath = (unit, start, end) => {
    // if there's a unit in the way, we can't get there
    if (this.isOccupied(end, unit)) return []

    // if we can reach the destination directly from start, just return the end hex
    if (this._canSeeHex(start, end, unit.team)) return [{ x: end.x, y: end.y }]

    // build graph of map
    let frontier = [start]
    let came_from = { [start.toString()]: null }
    const openHexes = [...this.hexGrid]
      .filter(this._isPassable(unit.team))
      .filter((h) => h !== start)
    openHexes.forEach((h) => {
      h.canSeeEnd = this._canSeeHex(h, end, unit.team)
    })

    while (frontier.length > 0) {
      const current = frontier.shift()
      if (current === end) break

      const getScore = (h) =>
        distance(h, end) + distance(h, current) * 1.3 + (h.canSeeEnd ? 0 : 0.1)

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

  _toString = ({ x, y }) => `${x},${y}`

  _canSeeHex = (a, b, team) =>
    this._hexesBetween(a, b).every(this._isPassable(team))

  _getMapValue = (hex) => {
    const coord = constants.MAP.find(([x, y]) => hex.x === x && hex.y === y)
    return coord ? coord[2] : 0
  }

  _isPassable = (team) => (h) => {
    if (!h) return false
    const unit = h.unit || this.strategyGame.unitManager.getUnitForHex(h)
    return h.index !== 1 && h.index !== 4 && (!unit || unit.team === team)
  }

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

  _hexesBetween(start, end) {
    const distance = start.distance(end)
    const step = 1.0 / Math.max(distance, 1)

    let hexes = []
    for (let i = 0; i <= distance; i++) {
      hexes.push(
        this.getHex(lerp(start, end, step * i)),
        this.getHex(lerp(this._nudge(start).l, this._nudge(end).l, step * i)),
        this.getHex(lerp(this._nudge(start).r, this._nudge(end).r, step * i)),
        this.getHex(lerp(this._nudge(start).z, this._nudge(end).z, step * i)),
      )
    }

    return uniqBy(hexes, (h) => h?.toString()).filter((h) => h !== start)
  }
}
