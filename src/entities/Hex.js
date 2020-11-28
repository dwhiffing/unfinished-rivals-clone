export class Hex {
  constructor(scene, hex) {
    this.scene = scene
    const { x, y } = scene.rivals.getScreenPos(hex.toPoint())
    this.hex = hex
    this.index = 0
    this.sprite = this.scene.add
      .sprite(x, y, 'hexagon')
      .setScale(scene.rivals.SCALED_TILE_SIZE)
  }

  setIndex(index) {
    this.index = index
    this.sprite.setFrame(index)
  }

  select() {
    this.active = true
    this.sprite.setFrame(1)
  }

  deselect() {
    if (!this.active) return
    this.active = false
    this.sprite.setFrame(0)
  }

  hover() {
    if (this.index === 0) this.select()
  }
}
