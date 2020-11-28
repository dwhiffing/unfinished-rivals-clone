import { Rivals } from '../../lib/rivals'
import { Hex } from '../entities/Hex'
import { Unit } from '../entities/Unit'

const { clientWidth, clientHeight } = document.documentElement
export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init(params) {
    this.room = params.room
  }

  create() {
    this.rivals = new Rivals(clientWidth, clientHeight)
    this.rivals.createGrid((hex) => new Hex(this, hex))

    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.room.onStateChange((state) => {
      const _state = state.toJSON()
      if (!this.node) {
        this.node = new Unit(this, _state.units[0].x, _state.units[0].y)
      } else {
        const hex = this.rivals.hexGrid.get(_state.units[0])
        this.node.tween(hex, this.rivals.getPath(this, this.node.hex, hex))
      }
    })
  }

  onMoveMouse(pointer) {
    if (this.activeHex) return
    const hoveredHex = this.rivals.getHexFromScreenPos(pointer)

    if (this.lastHoveredHex && !this.lastHoveredHex.active) {
      this.lastHoveredHex.deselect()
    }

    if (hoveredHex && hoveredHex.hexObject) {
      this.lastHoveredHex = hoveredHex.hexObject
      this.lastHoveredHex.hover()
    }
  }

  onClickMouse(pointer) {
    const clickedHex = this.rivals.getHexFromScreenPos(pointer)
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
