import { defineGrid, extendHex } from 'honeycomb-grid'
const WIDTH = 12
const HEIGHT = 7
const HEX_SIZE_TO_WIDTH_RATIO = 1.7321
const HEX_SIZE_TO_HEIGHT_RATIO = 1.582
const ABSOLUTE_TILE_SIZE = 225

export class Rivals {
  constructor(clientWidth = 1280, clientHeight = 800) {
    this.TILE_SIZE = clientWidth / (WIDTH * HEX_SIZE_TO_WIDTH_RATIO)
    this.SCALED_TILE_SIZE = this.TILE_SIZE / ABSOLUTE_TILE_SIZE

    const TILE_HEIGHT = this.TILE_SIZE * HEX_SIZE_TO_HEIGHT_RATIO
    this.OFFSET_Y = (clientHeight - TILE_HEIGHT * HEIGHT) / 2
  }

  createGrid(getHex) {
    this.ExtendedHexGrid = defineGrid(
      extendHex({
        size: this.TILE_SIZE,
        index: 0,
        unit: null,
        render() {
          const coord = MAP.find(([x, y]) => this.x === x && this.y === y)
          if (coord) this.index = coord[2]
          if (getHex) {
            this.hexObject = getHex(this)
          }
        },
      }),
    )
    this.hexGrid = this.ExtendedHexGrid.rectangle({
      width: WIDTH,
      height: HEIGHT,
      onCreate: (hex) => hex.render(),
    })
  }

  getHexFromScreenPos({ x: mouseX, y: mouseY }) {
    const hexCoords = this.ExtendedHexGrid.pointToHex(
      mouseX,
      mouseY - this.OFFSET_Y,
    )
    return this.hexGrid.get(hexCoords)
  }

  // TODO: this should try to go toward the destination in a straight line as much as possible
  getPath(unit, start, end) {
    this.hexGrid.forEach((h) => (h.parent = null))
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

      const neighbours = this.hexGrid
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

  getScreenPos(position) {
    // raw tile asset sizes
    const x = position.x + (392 * this.SCALED_TILE_SIZE) / 2
    const y = position.y + (452 * this.SCALED_TILE_SIZE) / 2 + this.OFFSET_Y

    return { x, y }
  }

  getScreenPosFromCoords(x, y) {
    const hex = this.hexGrid.get({ x, y })
    return this.getScreenPos(hex.toPoint())
  }
}

export const rivals = new Rivals()

const MAP = [
  // left base
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
  [0, 2, 1],
  [1, 2, 1],

  // left rocks
  [0, 4, 1],
  [0, 5, 1],
  [0, 6, 1],
  [1, 6, 1],

  // right base
  [10, 0, 1],
  [11, 0, 1],
  [9, 1, 1],
  [10, 1, 1],
  [11, 1, 1],
  [10, 2, 1],
  [11, 2, 1],

  // right rocks
  [11, 3, 1],
  [11, 4, 1],
  [10, 5, 1],
  [11, 5, 1],
  [10, 6, 1],
  [11, 6, 1],

  // middle rocks
  [3, 2, 1],
  [2, 3, 1],
  [5, 3, 1],
  [5, 5, 1],
  [8, 2, 1],
  [8, 3, 1],

  // resources
  [3, 5, 2],
  [2, 5, 2],
  [3, 6, 2],
  [4, 6, 2],
  [8, 5, 2],
  [7, 5, 2],
  [8, 6, 2],
  [7, 6, 2],

  // pads
  [4, 3, 3],
  [3, 3, 3],
  [4, 2, 3],
  [7, 3, 3],
  [6, 3, 3],
  [7, 2, 3],
]
