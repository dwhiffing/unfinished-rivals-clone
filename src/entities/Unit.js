const duration = 200

export class Unit {
  constructor(scene, { gridX, gridY, id, team, health = 100, damage = 10 }) {
    this.scene = scene
    this.strategyGame = scene.strategyGame
    this.id = id
    this.team = team
    this.health = health
    this.damage = damage
    this.gridX = gridX
    this.gridY = gridY
    this.path = []

    this.hex = this.strategyGame.hexes.get({ x: gridX, y: gridY })

    const screen = this.strategyGame.getScreenFromHex(this.hex)
    this.healthText = this.scene.add.text(
      screen.x,
      screen.y,
      this.health.toString(),
    )
    this.scale = this.strategyGame.SCALED_SIZE
    this.sprite = this.scene.add
      .sprite(screen.x, screen.y, 'units')
      .setFrame(team === 0 ? 1 : 0)
      .setScale(this.scale)
      .setAlpha(0.5)
      .setOrigin(0.5, 0.5)
    // .setInteractive()
    // this.sprite.on('pointerdown', this.select)
    this.active = true
  }

  update({ x, y, gridX, gridY, path, health = 100 }) {
    this.hex = this.strategyGame.getHexFromScreen(this.sprite)
    this.tween(x, y)
    if (this.lastX > x) {
      this.sprite.setScale(-this.scale, this.scale)
    } else {
      this.sprite.setScale(this.scale, this.scale)
    }
    this.gridX = gridX
    this.gridY = gridY
    this.path = path
    this.healthText.text = health.toString()
    this.health = health
    if (this.health <= 0) {
      this.destroy()
    }
    this.lastX = x
  }

  destroy() {
    this.sprite.destroy()
    this.active = false
    if (this.scene.activeUnit === this) this.scene.activeUnit = null
    this.healthText.destroy()
  }

  select() {
    if (!this.active) return
    this.sprite.setAlpha(1)
  }

  deselect() {
    if (!this.active) return
    this.sprite.setAlpha(0.5)
  }

  tweenOpts(opts) {
    return { targets: [this.sprite, this.healthText], duration, ...opts }
  }

  tween(_x, _y) {
    const height = document.documentElement.clientHeight
    const x = _x * this.scene.strategyGame.SCALE
    const y =
      _y * this.scene.strategyGame.SCALE +
      (height -
        this.scene.strategyGame.NATIVE_HEIGHT * this.scene.strategyGame.SCALE) /
        2
    this.scene.tweens.add(this.tweenOpts({ x, y }))
  }

  tweenPath(hex, path) {
    const onComplete = () => (this.hex = hex)
    const timeline = this.scene.tweens.createTimeline({ onComplete })
    path.forEach((hex) => {
      const opts = this.tweenOpts(this.strategyGame.getScreenFromHex(hex))
      timeline.add(opts)
    })
    timeline.play()
  }

  move({ x, y }) {
    if (!this.active) return
    const unitId = this.id
    this.scene.room.send('Move', { unitId, x, y })
    // this.deselect()
  }
}
