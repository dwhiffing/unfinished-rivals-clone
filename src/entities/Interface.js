const textOpts = { fontSize: 40, align: 'center' }
const PAD_STATUS_COLORS = ['#ffffff', '#ff0000', '#00ff00', '#ffff00']

export class Interface {
  constructor(scene) {
    this.scene = scene

    this.chargeText = this.scene.add
      .text(this.scene.cameras.main.width / 2, 40, '0', textOpts)
      .setOrigin(0.5)
    this.lineGraphics = this.scene.add.graphics()
  }

  update() {
    this.chargeText.style.color =
      PAD_STATUS_COLORS[this.scene.strategyGame.chargeIndex + 1]
    this.chargeText.text = this.scene.strategyGame.charge

    this.clear()
    const { activeUnit, lastHoveredHex, strategyGame } = this.scene
    if (!activeUnit || !lastHoveredHex) return

    this.lineGraphics.lineStyle(5, 0xffffff, 1.0)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(activeUnit.sprite.x, activeUnit.sprite.y)
    if (this._lastHovered !== lastHoveredHex || !this.path) {
      this.path = strategyGame.getPath(
        activeUnit,
        activeUnit.hex,
        lastHoveredHex.hex,
      )
      this._lastHovered = lastHoveredHex
    }
    if (this.path.length === 0) return

    this.path.forEach((hex, i) => {
      const coord = strategyGame.getScreenFromHex(hex)
      this.lineGraphics.lineTo(coord.x, coord.y)
    })
    this.lineGraphics.strokePath()
    this.lineGraphics.closePath()
  }

  clear() {
    this.lineGraphics.clear()
  }
}
