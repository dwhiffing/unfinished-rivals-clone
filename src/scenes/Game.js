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
    this.room.onLeave((code) => {
      if (code === 1000) localStorage.removeItem(this.room.id)
      this.scene.start('Lobby')
    })

    this.chargeText = this.add
      .text(this.cameras.main.width / 2, 40, '0', {
        fontSize: 40,
        align: 'center',
      })
      .setOrigin(0.5)

    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))
    this.units = []
    this.activeUnit = null
    const updateState = (state) => {
      const _state = state.toJSON()

      this.chargeText.text = _state.charge
      let tint = '#ffffff'
      if (_state.chargeIndex === 0) tint = '#ff0000'
      if (_state.chargeIndex === 1) tint = '#00ff00'
      if (_state.chargeIndex === 2) tint = '#ffff00'
      this.chargeText.style.color = tint

      if (!this.player && _state.players.length > 0) {
        this.player = _state.players.find((p) => p.id === this.room.sessionId)
      }

      _state.units.forEach((unit) => {
        const localUnit = this.units.find((u) => u.serverUnit.id === unit.id)
        if (localUnit) {
          localUnit.serverUnit = unit
          if (unit.x !== localUnit.sprite.x || unit.y !== localUnit.sprite.y) {
            localUnit.tween(unit.x, unit.y)
          }
        } else {
          this.units.push(new Unit(this, unit))
        }
      })

      _state.grid.forEach((hex) => {
        const localHex = this.rivals.hexGrid.get(hex)
        localHex.hexObject.setIndex(hex.index)
      })

      _state.padStatus.forEach((padStatus) => {
        padStatus.hexes.forEach((hex) => {
          const localHex = this.rivals.hexGrid.get(hex)
          localHex.hexObject.setPadStatus(padStatus.status)
        })
      })
    }
    updateState(this.room.state)
    this.room.onStateChange(updateState)
  }

  onMoveMouse(pointer) {
    if (this.activeHex) return
    const hoveredHex = this.rivals.getHexFromScreenPos(pointer)

    if (this.lastHoveredHex) {
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
    } else if (
      clickedUnit &&
      clickedUnit.serverUnit.team === this.player.team
    ) {
      this.activeUnit = clickedUnit
      clickedUnit.select()
    }
  }
}
