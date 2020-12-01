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
    this.strategyGame.createGrid((hex) => new Hex(this, hex))
    this.unitSprites = []
    this.activeUnit = null
    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.ui = new Interface(this)
    this.updateState(this.room.state)
    this.room.onStateChange(this.updateState)
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
      this.unitSprites.push(new Unit(this, serverUnit))
    })

    this.ui.update()
  }

  onMoveMouse(pointer) {
    this.ui.hover()
    const hoveredHex = this.strategyGame.getHexFromScreen(pointer)
    if (this.activeHex || !hoveredHex) return

    if (this.lastHoveredHex) this.lastHoveredHex.deselect()
    this.lastHoveredHex = hoveredHex.object
    this.lastHoveredHex.hover()
  }

  onClickMouse(pointer) {
    this.ui.clear()
    const hex = this.strategyGame.getHexFromScreen(pointer)
    const unit = this.unitSprites.find((u) => u.hex === hex)
    if (this.activeUnit && hex) {
      this.activeUnit.move(hex)
      this.activeUnit = null
    } else if (unit && unit.team === this.player.team) {
      this.activeUnit = unit
      unit.select()
    }
  }

  onLeave = (code) => {
    if (code === 1000) localStorage.removeItem(this.room.id)
    this.scene.start('Lobby')
  }
}
