import { defineGrid, extendHex } from 'honeycomb-grid'
import { Hex } from '../src/entities/Hex'

const obj = typeof window !== 'undefined' ? document.documentElement : {}
const { clientWidth = 10, clientHeight = 10 } = obj

const WIDTH = 11
const HEIGHT = 7

const HEX_SIZE_TO_WIDTH_RATIO = 1.7321
const TILE_SIZE = clientWidth / (WIDTH * HEX_SIZE_TO_WIDTH_RATIO)

const HEX_SIZE_TO_HEIGHT_RATIO = 1.582
const TILE_HEIGHT = TILE_SIZE * HEX_SIZE_TO_HEIGHT_RATIO
export const OFFSET_Y = (clientHeight - TILE_HEIGHT * HEIGHT) / 2

const ABSOLUTE_TILE_SIZE = 225
export const SCALED_TILE_SIZE = TILE_SIZE / ABSOLUTE_TILE_SIZE

export class Rivals {
  constructor() {}

  createGrid(sceneRef) {
    this.ExtendedHexGrid = defineGrid(
      extendHex({
        size: TILE_SIZE,
        render() {
          this.hexObject = new Hex(sceneRef, this)
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
    const hexCoords = this.ExtendedHexGrid.pointToHex(mouseX, mouseY - OFFSET_Y)
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
}
