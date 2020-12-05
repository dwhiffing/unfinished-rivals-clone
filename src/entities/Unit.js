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
    this.modelCount = 5
    this.path = []

    this.hex = this.strategyGame.hexes.get({ x: gridX, y: gridY })

    const screen = this.strategyGame.getScreenFromHex(this.hex)
    this.healthText = this.scene.add.text(0, 0, this.health.toString())
    this.x = screen.x
    this.y = screen.y
    this.scale = this.strategyGame.SCALED_SIZE * 0.6

    this.sprites = {}
    for (var index = 0; index < this.modelCount; index++) {
      const r = this.strategyGame.tileSize * 0.5
      const x = r * Math.cos((2 * Math.PI * index) / this.modelCount)
      const y = r * Math.sin((2 * Math.PI * index) / this.modelCount)
      this.sprites[index] = this.scene.add
        .sprite(x, y, 'units')
        .setFrame(team === 0 ? 1 : 0)
        .setScale(this.scale)
        .setAlpha(0.5)
        .setOrigin(0.45, 0.7)
    }
    this.container = this.scene.add.container(this.x, this.y)
    this.container.add([...Object.values(this.sprites), this.healthText])
    this.active = true
  }

  update({ x, y, gridX, gridY, path, health = 100 }) {
    this.hex = this.strategyGame.getHexFromScreen(this.container)
    this.tween(x, y)
    if (this.lastX > (this.team === 0 ? x : -x)) {
      Object.values(this.sprites).forEach((s) =>
        s.setScale(-this.scale, this.scale),
      )
    } else {
      Object.values(this.sprites).forEach((s) =>
        s.setScale(this.scale, this.scale),
      )
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
    Object.values(this.sprites).forEach((s) => s.destroy())
    this.active = false
    if (this.scene.activeUnit === this) this.scene.activeUnit = null
    this.healthText.destroy()
  }

  select() {
    if (!this.active) return
  }

  deselect() {
    if (!this.active) return
  }

  tween(_x, _y) {
    const height = document.documentElement.clientHeight
    const x = _x * this.scene.strategyGame.SCALE
    const y =
      _y * this.scene.strategyGame.SCALE +
      (height -
        this.scene.strategyGame.NATIVE_HEIGHT * this.scene.strategyGame.SCALE) /
        2
    this.scene.tweens.add({
      targets: this.container,
      duration,
      x,
      y,
    })
  }

  move({ x, y }) {
    if (!this.active) return
    const unitId = this.id
    this.scene.room.send('Move', { unitId, x, y })
    // this.deselect()
  }
}
