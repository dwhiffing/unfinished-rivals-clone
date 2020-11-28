import { defineGrid, extendHex } from 'honeycomb-grid'
const WIDTH = 11
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
        render() {
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

  getPath(scene, start, end) {
    let candidates = [start]
    let path = []
    while (candidates.length > 0) {
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

      path.push(current)
      if (current === end) return path

      const neighbours = scene.rivals.hexGrid
        .neighborsOf(current)
        .filter((h) => !!h && !candidates.includes(h))
      candidates = candidates.concat(neighbours)
    }

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
