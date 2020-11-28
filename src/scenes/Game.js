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
    this.units = []
    this.activeUnit = null

    this.room.onStateChange((state) => {
      const _state = state.toJSON()
      _state.units.forEach((unit) => {
        const localUnit = this.units.find((u) => u.serverUnit.id === unit.id)
        if (!localUnit) {
          this.units.push(new Unit(this, unit))
        } else {
          localUnit.serverUnit = unit
          localUnit.tween(unit.x, unit.y)
        }
      })
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

    const clickedUnit = this.units.find(
      (u) =>
        u.serverUnit.gridX === clickedHex.x &&
        u.serverUnit.gridY === clickedHex.y,
    )
    if (this.activeUnit) {
      this.activeUnit.move(clickedHex)
      this.activeUnit = null
    } else if (clickedUnit) {
      this.activeUnit = clickedUnit
      clickedUnit.select()
    }
  }
}
