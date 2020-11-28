import * as constants from '../../lib/rivals'
import { getScreenPos } from '../utils'

export class Unit {
  constructor(scene, x, y) {
    this.scene = scene
    const hex = this.scene.rivals.hexGrid.get({ x, y })
    this.hex = hex

    const screen = getScreenPos(hex.toPoint())
    this.sprite = this.scene.add
      .sprite(screen.x, screen.y, 'node')
      .setScale(constants.SCALED_TILE_SIZE)
      .setAlpha(0.5)
  }

  select() {
    this.active = true
    this.sprite.setAlpha(1)
  }

  deselect() {
    this.active = false
    this.sprite.setAlpha(0.5)
  }

  tween(hex, path) {
    const timeline = this.scene.tweens.createTimeline({
      onComplete: () => (this.hex = hex),
    })
    path.forEach((hex) => {
      const { x, y } = getScreenPos(hex.toPoint())
      timeline.add({ targets: [this.sprite], x, y, duration: 200 })
    })
    timeline.play()
  }

  move(hex) {
    this.scene.room.send('Move', { x: hex.x, y: hex.y })
  }
}
