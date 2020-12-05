export class Button extends Phaser.GameObjects.Sprite {
  onInputOver = () => {}
  onInputOut = () => {}
  onInputUp = () => {}

  constructor(
    scene,
    x,
    y,
    actionOnClick = () => {},
    label = '',
    texture = 'button',
    overFrame = 0,
    outFrame = 0,
    downFrame = 1,
  ) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    this.text = scene.add.text(this.x, this.y, label).setOrigin(0.5)

    this.setFrame(outFrame)
      .setInteractive()

      .on('pointerover', () => {
        this.onInputOver()
        this.setFrame(overFrame)
      })
      .on('pointerdown', () => {
        actionOnClick()
        this.setFrame(downFrame)
      })
      .on('pointerup', () => {
        this.onInputUp()
        this.setFrame(overFrame)
      })
      .on('pointerout', () => {
        this.onInputOut()
        this.setFrame(outFrame)
      })
  }

  destroy() {
    this.text.destroy()
    super.destroy()
  }
}
