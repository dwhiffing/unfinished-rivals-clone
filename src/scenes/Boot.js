export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    const progress = this.add.graphics()
    this.load.on('progress', (value) => {
      const { width, height } = this.sys.game.config
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, 0, width * value, height)
    })

    this.load.on('complete', () => {
      progress.destroy()
      this.scene.start('Game')
    })
  }
}
