import { PAD_COLORS_OCT, GREYS, GREENS } from '../constants'

export class Hex {
  constructor(scene, hex) {
    this.scene = scene
    this.hex = hex
    this.index = 0
    this.scale = scene.strategyGame.hexes.scale

    const { x, y } = scene.strategyGame.hexes.getScreenFromHex(hex)
    this.sprite = this.scene.add.quad(x, y, 'hexagon').setScale(this.scale)
    this.padBorder = this.scene.add.quad(x, y, 'hexagon').setScale(this.scale)
    this.highlight = this.scene.add.quad(x, y, 'hexagon').setScale(this.scale)

    this.padBorder.setFrame(2)
    this.highlight.setFrame(1)
    this.alphaQuad(this.sprite, 0)
    this.alphaQuad(this.padBorder, 0)
    this.alphaQuad(this.highlight, 0)
    this.greyTint = Phaser.Math.RND.pick(GREYS)
    this.greenTint = Phaser.Math.RND.pick(GREENS)
    // this.scene.add
    //   .text(x, y, hex.x.toString() + ',' + hex.y, {fontSize: 15})
    //   .setOrigin(0.5)
  }

  setStatus(status) {
    this.tintQuad(this.padBorder, PAD_COLORS_OCT[status + 1])
  }

  select() {
    this.alphaQuad(this.highlight, 0.5)
  }

  deselect() {
    this.alphaQuad(this.highlight, 0)
  }

  setIndex(i = this.index) {
    if (this._hasSetIndex) return

    this._hasSetIndex = true
    this.index = i
    this.sprite.resetColors()

    this.alphaQuad(this.sprite, 1)
    this.tintQuad(this.sprite, this.greenTint)

    if (i === 1) {
      this.sprite.setFrame(4)
      this.tintQuad(this.sprite, this.greyTint)
    } else if (i === 2) {
      this.padBorder.setFrame(3)
      this.alphaQuad(this.padBorder, 1)
    } else if (i === 3) {
      this.tintQuad(this.sprite, 0x7f8674)
      this.alphaQuad(this.padBorder, 1)
      this.padBorder.setAngle(this.getPadAngle())
    } else if (i === 4) {
      this.sprite.setFrame(4)
      const index = this.sprite.x > this.scene.cameras.main.width / 2 ? 2 : 1
      this.tintQuad(this.sprite, PAD_COLORS_OCT[index])
    }
  }

  alphaQuad(quad, alpha) {
    quad.topLeftAlpha = alpha
    quad.topRightAlpha = alpha
    quad.bottomLeftAlpha = alpha
    quad.bottomRightAlpha = alpha
  }

  tintQuad(quad, tint) {
    quad.topLeftColor = tint
    quad.topRightColor = tint
    quad.bottomLeftColor = tint
    quad.bottomRightColor = tint
  }

  getPadAngle = () => {
    let angle = 300
    if (this.checkForPads(['SW', 'SE'])) angle = 180
    if (this.checkForPads(['E', 'NE'])) angle = 60
    return angle
  }

  checkForPads = (dir) =>
    this.scene.strategyGame.hexes.hexGrid
      .neighborsOf(this.hex, dir)
      .every((h) => h.index === 3)
}
