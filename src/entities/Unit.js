import { TICK_RATE, TILE_SIZE } from '../../lib/constants'

// TODO: draw lasers for units shooting eachother
export class Unit {
  constructor(scene, unitOpts = {}) {
    this.scene = scene
    this.strategyGame = scene.strategyGame
    this.modelCount = 5
    this.path = []
    this.healthText = this.scene.add.text(0, -50, '').setOrigin(0.5)
    this.scale = this.strategyGame.hexes.scale * 0.6
    this.sprites = {}
    this.id = unitOpts.id
    this.damage = unitOpts.damage
    this.team = unitOpts.team

    for (var index = 0; index < this.modelCount; index++) {
      const r = TILE_SIZE * 0.5
      const x = r * Math.cos((2 * Math.PI * index) / this.modelCount)
      const y = r * Math.sin((2 * Math.PI * index) / this.modelCount)
      this.sprites[index] = this.scene.add
        .sprite(x, y, 'units')
        .setFrame(unitOpts.team === 0 ? 1 : 0)
        .setScale(this.scale)
        .setAlpha(0.5)
        .setOrigin(0.45, 0.7)
    }
    this.container = this.scene.add.container(unitOpts.x, unitOpts.y)
    this.container.add([...Object.values(this.sprites), this.healthText])
    const size = TILE_SIZE * 1.5
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
      Phaser.Geom.Rectangle.Contains,
    )
    this.container.on('pointerdown', () => {
      this.scene.selectUnit(this)
    })

    this.update(unitOpts)
  }

  update({ x, y, gridX, gridY, path, health = 100 }) {
    this.tween(x, y)

    if (this.lastX !== x) {
      const isLeft = this.lastX > x || (this.lastX === x && this.team === 1)
      this.setScale(isLeft ? -1 : 1, 1)
      this.lastX = x
    }

    this.hex = this.strategyGame.hexes.getHexFromScreen(this.container)
    this.gridX = gridX
    this.gridY = gridY
    this.path = path

    this.health = health
    this.healthText.text = health.toString()
    if (this.health <= 0) this.destroy()
  }

  destroy() {
    Object.values(this.sprites).forEach((s) => s.destroy())
    if (this.scene.activeUnit === this) this.scene.activeUnit = null
    this.healthText.destroy()
  }

  select() {
    Object.values(this.sprites).forEach((s) => s.setAlpha(1))
    return this
  }

  deselect() {
    Object.values(this.sprites).forEach((s) => s.setAlpha(0.5))
    return this
  }

  setScale = (x, y) => {
    Object.values(this.sprites).forEach((s) =>
      s.setScale(x * this.scale, y * this.scale),
    )
  }

  tween(_x, _y) {
    const x = _x
    const y = _y
    const targets = this.container
    this.scene.tweens.add({ targets, duration: TICK_RATE, x, y })
  }

  move({ x, y }) {
    const unitId = this.id
    this.scene.room.send('Move', { unitId, x, y })
  }
}
