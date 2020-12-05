export class Hex {
  constructor(scene, hex) {
    this.scene = scene
    const { x, y } = scene.strategyGame.getScreenFromHex(hex)
    this.hex = hex
    this.index = 0
    const offset = 0
    const modifier = 1
    // const offset = 100
    // const modifier = hex.y / 50 + 0.6
    this.sprite = this.scene.add
      .quad(x, offset + y * modifier, 'hexagon')
      .setScale(
        scene.strategyGame.SCALED_SIZE,
        scene.strategyGame.SCALED_SIZE * modifier,
      )

    this.alphaQuad(this.sprite, 0)

    this.padBorder = this.scene.add
      .quad(x, offset + y * modifier, 'hexagon')
      .setScale(
        scene.strategyGame.SCALED_SIZE,
        scene.strategyGame.SCALED_SIZE * modifier,
      )
      .setFrame(2)

    this.alphaQuad(this.padBorder, 0)
    this.highlight = this.scene.add
      .quad(x, offset + y * modifier, 'hexagon')
      .setScale(
        scene.strategyGame.SCALED_SIZE,
        scene.strategyGame.SCALED_SIZE * modifier,
      )
      .setFrame(1)
    this.alphaQuad(this.highlight, 0)
    // this.scene.add
    //   .text(x, y, hex.x.toString() + ',' + hex.y, {
    //     fontSize: 15,
    //   })
    //   .setOrigin(0.5)
    this.greyTint = Phaser.Math.RND.pick([
      0x75786b,
      0x888876,
      0x868575,
      0x737e6b,
      0x6b7764,
    ])
    this.greenTint = Phaser.Math.RND.pick([
      0x5e9956,
      0x7ea559,
      0x648160,
      0x506b4a,
      0x5d914a,
      0x538d4d,
      0x527a4e,
      0x667550,
      0x6d8150,
    ])
  }

  setIndex(i = this.index) {
    if (this._hasSetIndex) return
    this._hasSetIndex = true
    this.index = i
    this.sprite.resetColors()

    this.alphaQuad(this.sprite, 1)
    this.tintQuad(this.sprite, this.greenTint)

    if (i === 1) {
      this.tintQuad(this.sprite, this.greyTint)
      this.sprite.setFrame(4)
    }
    if (i === 2) {
      this.padBorder.setFrame(3)
      this.alphaQuad(this.padBorder, 1)
    }
    if (i === 3) {
      let angle = 300
      if (
        this.scene.strategyGame.hexes.hexGrid
          .neighborsOf(this.hex, ['SW', 'SE'])
          .every((h) => h.index === 3)
      ) {
        angle = 180
      }
      if (
        this.scene.strategyGame.hexes.hexGrid
          .neighborsOf(this.hex, ['E', 'NE'])
          .every((h) => h.index === 3)
      ) {
        angle = 60
      }
      this.alphaQuad(this.padBorder, 1)
      this.padBorder.setAngle(angle)
      this.tintQuad(this.sprite, 0x7f8674)
    }
    if (i === 4) {
      this.sprite.setFrame(4)
      if (this.sprite.x > this.scene.cameras.main.width / 2) {
        this.tintQuad(this.sprite, PAD_STATUS_COLORS[2])
      } else {
        this.tintQuad(this.sprite, PAD_STATUS_COLORS[1])
      }
    }
  }

  setStatus(status) {
    this.tintQuad(this.padBorder, PAD_STATUS_COLORS[status + 1])
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

  select() {
    this.alphaQuad(this.highlight, 0.5)
    // if (this.index !== 1) this.sprite.setFrame(1)
  }

  deselect() {
    this.alphaQuad(this.highlight, 0)
    // if (this.index !== 1) this.sprite.setFrame(0)
  }

  hover() {
    this.select()
  }
}

const PAD_STATUS_COLORS = [0xcccccc, 0x2754fa, 0xef4a3c, 0xe5dc12]
