import { StrategyGame } from '../../lib/strategyGame'
import { Hex } from '../entities/Hex'
import { Unit } from '../entities/Unit'
import { Interface } from '../entities/Interface'

const { clientWidth: width, clientHeight: height } = document.documentElement
export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init(params) {
    this.room = params.room
    this.room.onLeave(this.onLeave)
  }

  create() {
    this.strategyGame = new StrategyGame(width, height)
    this.strategyGame.init((hex) => new Hex(this, hex))
    this.unitSprites = []
    this.activeUnit = null
    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.ui = new Interface(this)
    this.updateState(this.room.state)
    this.room.onStateChange(this.updateState)
  }

  update() {
    this.ui.update()
  }

  updateState = (serverState) => {
    const state = serverState.toJSON()

    if (state.phaseIndex === -1) return

    this.strategyGame.clientSyncState(state)

    if (!this.player)
      this.player = state.players.find((p) => p.id === this.room.sessionId)

    state.units.forEach((serverUnit) => {
      const unit = this.unitSprites.find((u) => u.id === serverUnit.id)
      if (unit) return unit.update(serverUnit)
      const clientUnit = new Unit(this, serverUnit)
      this.unitSprites.push(clientUnit)
      clientUnit.update(serverUnit)
    })
    this.unitSprites.forEach((u) => {
      if (!state.units.some((su) => su.id === u.id)) {
        u.destroy()
      }
    })
  }

  onMoveMouse(pointer) {
    if (this.strategyGame.phaseIndex === -1) return
    const hoveredHex = this.strategyGame.getHexFromScreen(pointer)
    if (this.activeHex || !hoveredHex) return

    if (this.lastHoveredHex) this.lastHoveredHex.deselect()
    this.lastHoveredHex = hoveredHex.object
    this.lastHoveredHex.hover()
  }

  onClickMouse(pointer) {
    this.ui.clear()
    if (this.strategyGame.phaseIndex === -1) return
    const hex = this.strategyGame.getHexFromScreen(pointer)
    const unit = this.unitSprites.find(
      (u) => u.gridX === hex.x && u.gridY === hex.y,
    )
    if (
      this.activeUnit &&
      this.activeUnit.active &&
      hex &&
      !this.strategyGame.isOccupied(hex, this.activeUnit)
    ) {
      this.activeUnit.move(hex)
      return
    }
    if (unit && unit.team === this.player.team && unit.active) {
      this.activeUnit && this.activeUnit.deselect()
      this.activeUnit = unit
      unit.select()
    }
  }

  onLeave = (code) => {
    if (code === 1000) localStorage.removeItem(this.room.id)
    this.scene.start('Lobby')
  }
}
