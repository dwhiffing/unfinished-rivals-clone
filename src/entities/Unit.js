const duration = 200
export class Unit {
  constructor(scene, { gridX, gridY, id, team, health = 100, damage = 10 }) {
    this.scene = scene
    this.strategyGame = scene.strategyGame
    this.id = id
    this.team = team
    this.health = health
    this.damage = damage

    this.hex = this.strategyGame.hexes.get({ x: gridX, y: gridY })

    const screen = this.strategyGame.getScreenPos(this.hex.toPoint())
    this.healthText = this.scene.add.text(
      screen.x,
      screen.y,
      this.health.toString(),
    )
    this.sprite = this.scene.add
      .sprite(screen.x, screen.y, team === 0 ? 'node' : 'node2')
      .setScale(this.strategyGame.SCALED_TILE_SIZE)
      .setAlpha(0.5)
  }

  update({ x, y, health = 100 }) {
    this.hex = this.strategyGame.getHexFromScreenPos(this.sprite)
    this.tween(x, y)
    this.healthText.text = health.toString()
    this.health = health
    if (this.health <= 0) {
      this.sprite.destroy()
      this.healthText.destroy()
    }
  }

  select() {
    this.sprite.setAlpha(1)
  }

  deselect() {
    this.sprite.setAlpha(0.5)
  }

  tweenOpts(opts) {
    return { targets: [this.sprite, this.healthText], duration, ...opts }
  }

  tween(x, y) {
    this.scene.tweens.add(this.tweenOpts({ x, y }))
  }

  tweenPath(hex, path) {
    const onComplete = () => (this.hex = hex)
    const timeline = this.scene.tweens.createTimeline({ onComplete })
    path.forEach((hex) => {
      const opts = this.tweenOpts(this.strategyGame.getScreenPos(hex.toPoint()))
      timeline.add(opts)
    })
    timeline.play()
  }

  move({ x, y }) {
    const unitId = this.id
    this.scene.room.send('Move', { unitId, x, y })
    this.deselect()
  }
}
