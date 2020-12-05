import { Button } from './Button'

const PAD_STATUS_COLORS = ['#ffffff', '#ef4a3c', '#2754fa', '#e5dc12']

const textOpts = { fontSize: 40, align: 'center' }

export class Interface {
  constructor(scene) {
    this.scene = scene

    this.connectionText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        'Waiting for another player...',
        { ...textOpts },
      )
      .setOrigin(0.5)
  }

  end() {
    this.ended = true
    this.connectionText.setAlpha(1)
    const winningPlayer = this.scene.strategyGame.players.find(
      (p) => p.health !== 0,
    )
    this.connectionText.text =
      winningPlayer.team === 0 ? 'Red player has won!' : 'Blue player has won!'
    this.connectionText.setDepth(10)
  }

  start() {
    this.connectionText.setAlpha(0)
    this.started = true
    this.redHealthText = this.scene.add
      .text(150, 40, '100', { ...textOpts, color: PAD_STATUS_COLORS[1] })
      .setOrigin(0.5)

    this.blueHealthText = this.scene.add
      .text(this.scene.cameras.main.width - 150, 40, '100', {
        ...textOpts,
        color: PAD_STATUS_COLORS[2],
      })
      .setOrigin(0.5)

    this.chargeText = this.scene.add
      .text(this.scene.cameras.main.width / 2, 40, '0', textOpts)
      .setOrigin(0.5)
    this.lineGraphics = this.scene.add.graphics()

    this.spawnButton = new Button(
      this.scene,
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height - 50,
      () => this.scene.room.send('Spawn'),
      'Spawn',
    )
  }

  update() {
    if (!this.started) return

    if (this.scene.strategyGame.phaseIndex === 1 && !this.ended) this.end()

    this.chargeText.style.color =
      PAD_STATUS_COLORS[this.scene.strategyGame.chargeIndex + 1]
    this.chargeText.text = this.scene.strategyGame.charge
    const players = this.scene.strategyGame.players || []
    this.redHealthText.text = players[0] ? players[0].health.toString() : '0'
    this.blueHealthText.text = players[1] ? players[1].health.toString() : '0'

    this.clear()
    const { activeUnit, lastHoveredHex, strategyGame } = this.scene
    if (!activeUnit || !lastHoveredHex) return

    this.lineGraphics.lineStyle(5, 0xffffff, 1.0)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(activeUnit.container.x, activeUnit.container.y)
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
    if (this.lineGraphics) this.lineGraphics.clear()
  }
}
