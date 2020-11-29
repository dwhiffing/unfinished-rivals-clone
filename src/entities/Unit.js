const duration = 200
export class Unit {
  constructor(scene, { gridX, gridY, id, team }) {
    this.scene = scene
    this.strategyGame = scene.strategyGame
    this.id = id
    this.team = team

    this.hex = this.strategyGame.hexes.get({ x: gridX, y: gridY })

    const screen = this.strategyGame.getScreenPos(this.hex.toPoint())
    this.sprite = this.scene.add
      .sprite(screen.x, screen.y, team === 0 ? 'node' : 'node2')
      .setScale(this.strategyGame.SCALED_TILE_SIZE)
      .setAlpha(0.5)
  }

  update(unit) {
    this.hex = this.strategyGame.getHexFromScreenPos(this.sprite)
    this.tween(unit.x, unit.y)
  }

  select() {
    this.sprite.setAlpha(1)
  }

  deselect() {
    this.sprite.setAlpha(0.5)
  }

  tweenOpts(opts) {
    return { targets: [this.sprite], duration, ...opts }
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
