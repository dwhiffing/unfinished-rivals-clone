import { StrategyGame } from '../../lib/strategyGame'
import { Hex } from '../entities/Hex'
import { Unit } from '../entities/Unit'
import { Interface } from '../entities/Interface'

// TODO: fog of war
// this means pathfinding needs to be based on what can be seen by the client
export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init(params) {
    this.room = params.room
    this.room.onLeave(this.onLeave)
    this.unitSprites = []
    this.activeUnit = null
    this.started = false
  }

  create() {
    this.strategyGame = new StrategyGame()
    this.strategyGame.init((hex) => new Hex(this, hex))
    this.ui = new Interface(this)
    this.syncState(this.room.state)
    this.room.onStateChange(this.syncState)

    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))
  }

  start = (state) => {
    if (state.players.length < 2) return
    this.started = true
    this.ui.start()
    this.player = state.players.find((p) => p.id === this.room.sessionId)
  }

  update() {
    if (this.phaseIndex === -1) return
    this.ui.update()
    this._justSelected = false
  }

  syncState = (serverState) => {
    const state = serverState.toJSON()
    if (typeof state.phaseIndex !== 'number' || state.phaseIndex === -1) return
    if (!this.started) this.start(state)
    this.strategyGame.clientSyncState(state)
    this.unitSprites = this.updateUnits(state)
  }

  onMoveMouse(pointer) {
    if (this.strategyGame.phaseIndex === -1) return

    const hoveredHex = this.strategyGame.hexes.getHexFromScreen(pointer)
    if (this.activeHex || !hoveredHex) return

    if (this.lastHoveredHex) this.lastHoveredHex.deselect()
    this.lastHoveredHex = hoveredHex.object
    this.lastHoveredHex.select()
  }

  onClickMouse(pointer) {
    if (this.strategyGame.phaseIndex === -1) return
    this.ui.clear()

    const hex = this.strategyGame.hexes.getHexFromScreen(pointer)
    if (hex) {
      if (this.activeUnit && !this._justSelected) this.activeUnit.move(hex)
    }
  }

  onLeave = (code) => {
    if (code === 1000) localStorage.removeItem(this.room.id)
    this.scene.start('Lobby')
  }

  selectUnit = (unit) => {
    if (!unit || unit.team !== this.player.team) return
    if (this.activeUnit === unit) return
    this.activeUnit?.deselect()
    this._justSelected = true
    this.activeUnit = unit.select()
  }

  updateUnits = (state) => {
    state.units.forEach((serverUnit) => {
      const sprite = this.unitSprites.find((u) => u.id === serverUnit.id)
      if (sprite) {
        sprite.update(serverUnit)
      } else {
        const newUnit = new Unit(this, serverUnit)
        this.unitSprites.push(newUnit)
        this.selectUnit(newUnit)
      }
    })

    return this.unitSprites.filter((u) => {
      const isPresent = state.units.some((su) => su.id === u.id)
      if (!isPresent) u.destroy()
      return isPresent
    })
  }
}
