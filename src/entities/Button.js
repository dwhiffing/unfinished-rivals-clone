export class Button extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, actionOnClick = () => {}, label = '') {
    super(scene, x, y, 'button')
    scene.add.existing(this)
    this.text = scene.add.text(this.x, this.y, label).setOrigin(0.5)

    this.setFrame(0)
      .setInteractive()
      .on('pointerover', () => {
        this.setFrame(0)
      })
      .on('pointerdown', () => {
        actionOnClick()
        this.setFrame(1)
      })
      .on('pointerup', () => {
        this.setFrame(0)
      })
      .on('pointerout', () => {
        this.setFrame(0)
      })
  }

  destroy() {
    this.text.destroy()
    super.destroy()
  }
}
