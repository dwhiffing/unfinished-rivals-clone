import { HexService } from '../entities/HexService'
import { Unit } from '../entities/Unit'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init(params) {
    this.room = params.room
  }

  create() {
    this.hexService = new HexService(this)
    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.room.onStateChange((state) => {
      const _state = state.toJSON()
      if (!this.node) {
        this.node = new Unit(this, _state.units[0].x, _state.units[0].y)
      } else {
        const hex = this.hexService.hexGrid.get(_state.units[0])
        this.node.tween(hex)
      }
    })
  }

  onMoveMouse(pointer) {
    if (!this.activeHex) {
      const hoveredHex = this.hexService.getHexFromScreenPos(pointer)

      if (this.lastHoveredHex && !this.lastHoveredHex.active) {
        this.lastHoveredHex.deselect()
      }

      if (hoveredHex && hoveredHex.hexObject) {
        this.lastHoveredHex = hoveredHex.hexObject
        this.lastHoveredHex.hover()
      }
    }
  }

  onClickMouse(pointer) {
    const clickedHex = this.hexService.getHexFromScreenPos(pointer)
    if (!clickedHex) return

    if (this.node.active) {
      this.node.move(clickedHex)
      this.node.deselect()
      return
    }

    if (clickedHex === this.node.hex && !this.node.active) {
      this.node.select()
    }
  }

  update(time, delta) {}
}
