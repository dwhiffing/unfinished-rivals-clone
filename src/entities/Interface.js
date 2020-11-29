const textOpts = { fontSize: 40, align: 'center' }
const PAD_STATUS_COLORS = ['#ffffff', '#ff0000', '#00ff00', '#ffff00']

export class Interface {
  constructor(scene) {
    this.scene = scene

    this.chargeText = this.scene.add
      .text(this.scene.cameras.main.width / 2, 40, '0', textOpts)
      .setOrigin(0.5)
  }

  update() {
    this.chargeText.text = this.scene.strategyGame.charge
    this.chargeText.style.color =
      PAD_STATUS_COLORS[this.scene.strategyGame.chargeIndex + 1]
  }
}
