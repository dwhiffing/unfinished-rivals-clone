export class Unit {
  constructor(scene, serverUnit) {
    this.scene = scene
    this.serverUnit = serverUnit
    const hex = this.scene.rivals.hexGrid.get({
      x: serverUnit.gridX,
      y: serverUnit.gridY,
    })
    this.hex = hex

    const screen = scene.rivals.getScreenPos(hex.toPoint())
    this.sprite = this.scene.add
      .sprite(screen.x, screen.y, 'node')
      .setScale(scene.rivals.SCALED_TILE_SIZE)
      .setAlpha(0.5)
  }

  select() {
    this.active = true
    this.sprite.setAlpha(1)
  }

  deselect() {
    this.active = false
    this.sprite.setAlpha(0.5)
  }

  tween(x, y) {
    this.scene.tweens.add({
      targets: [this.sprite],
      x,
      y,
      duration: 200,
    })
  }

  tweenPath(hex, path) {
    const timeline = this.scene.tweens.createTimeline({
      onComplete: () => (this.hex = hex),
    })
    path.forEach((hex) => {
      const { x, y } = this.scene.rivals.getScreenPos(hex.toPoint())
      timeline.add({ targets: [this.sprite], x, y, duration: 200 })
    })
    timeline.play()
  }

  move(hex) {
    this.scene.room.send('Move', { x: hex.x, y: hex.y })
    this.deselect()
  }
}
