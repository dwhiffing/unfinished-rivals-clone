import * as constants from '../../lib/rivals'
import { getScreenPos } from '../utils'

export class Hex {
  constructor(scene, hex) {
    this.scene = scene
    const { x, y } = getScreenPos(hex.toPoint())
    this.hex = hex
    this.sprite = this.scene.add
      .sprite(x, y, 'hexagon')
      .setScale(constants.SCALED_TILE_SIZE)
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
    if (!this.active) this.sprite.setFrame(1)
  }
}
