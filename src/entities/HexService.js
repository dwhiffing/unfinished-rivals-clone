import { defineGrid, extendHex } from 'honeycomb-grid'
import * as constants from '../constants'
import { Hex } from './Hex'

export class HexService {
  constructor(sceneRef) {
    this.scene = sceneRef
    this.ExtendedHexGrid = defineGrid(
      extendHex({
        size: constants.TILE_SIZE,
        render() {
          this.hexObject = new Hex(sceneRef, this)
        },
      }),
    )
    this.hexGrid = this.ExtendedHexGrid.rectangle({
      width: constants.WIDTH,
      height: constants.HEIGHT,
      onCreate: (hex) => hex.render(),
    })
  }

  getHexFromScreenPos({ x: mouseX, y: mouseY }) {
    const hexCoords = this.ExtendedHexGrid.pointToHex(
      mouseX,
      mouseY - constants.OFFSET_Y,
    )
    return this.hexGrid.get(hexCoords)
  }
}
