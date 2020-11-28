import * as constants from '../constants'
import { getScreenPos } from '../utils'

export class Hex {
  constructor(scene, hex) {
    this.scene = scene
    const screen = getScreenPos(hex.toPoint())
    this.hex = hex
    this.sprite = this.scene.add
      .sprite(screen.x, screen.y, 'hexagon')
      .setScale(constants.SCALED_TILE_SIZE)
    this.gridX = hex.x
    this.gridY = hex.y
  }

  select() {
    this.active = true
    this.sprite.setFrame(1)
  }

  deselect() {
    this.active = false
    this.sprite.setFrame(0)
  }

  hover() {
    if (!this.active) {
      this.sprite.setFrame(1)
    }
  }
}
