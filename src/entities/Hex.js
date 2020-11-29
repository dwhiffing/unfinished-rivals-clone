export class Hex {
  constructor(scene, hex) {
    this.scene = scene
    const { x, y } = scene.strategyGame.getScreenFromHex(hex)
    this.hex = hex
    this.index = 0
    this.sprite = this.scene.add
      .sprite(x, y, 'hexagon')
      .setScale(scene.strategyGame.SCALED_SIZE)
  }

  setIndex(i) {
    this.index = i
    this.sprite.clearTint()
    if (i === 1) this.sprite.setFrame(2)
    if (i === 2) this.sprite.setTint(0x00ff00)
    if (i === 3) this.sprite.setTint(0x000)
  }

  setStatus(status) {
    this.sprite.setTint(PAD_STATUS_COLORS[status + 1])
  }

  select() {
    if (this.index !== 1) this.sprite.setFrame(1)
  }

  deselect() {
    if (this.index !== 1) this.sprite.setFrame(0)
  }

  hover() {
    this.select()
  }
}

const PAD_STATUS_COLORS = [0x000000, 0xff0000, 0x00ff00, 0xffff00]
