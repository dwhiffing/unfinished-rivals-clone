import { Hexes } from './hexes'
import { UnitManager } from './unitManager'
import { PadManager } from './padManager'

export class StrategyGame {
  constructor() {
    this.phaseIndex = -1
    this.players = []
    this.padManager = new PadManager(this)
    this.unitManager = new UnitManager(this)
    this.hexes = new Hexes(this)
  }

  get units() {
    return this.unitManager.units
  }

  get pads() {
    return this.padManager.pads
  }

  get charge() {
    return this.padManager.charge
  }

  get chargeIndex() {
    return this.padManager.chargeIndex
  }

  init(renderHexObject) {
    this.hexes.createGrid(renderHexObject)
  }

  addPlayer = (player) => {
    this.players.push(player)
  }

  removePlayer = (id) => {
    this.players = this.players.filter((p) => p.id !== id)
    this.phaseIndex = 1
  }

  start = () => {
    this.phaseIndex = 0
  }

  tick = () => {
    if (this.phaseIndex === -1) return
    this.players.forEach((p) => (p.money += 1))
    this.unitManager.tick()
    this.padManager.tick()
  }

  clientSyncState = (state) => {
    this.players = state.players
    this.phaseIndex = state.phaseIndex

    this.unitManager.units = state.units
    this.padManager.pads = state.pads
    this.padManager.charge = state.charge
    this.padManager.chargeIndex = state.chargeIndex

    state.hexes.forEach((h) => {
      const hex = this.hexes.getHex(h)
      hex.object.setIndex(hex.index)
      hex.unit = this.unitManager.getUnitForHex(hex)
    })

    state.pads.forEach((pad) =>
      pad.hexes.forEach((hex) =>
        this.hexes.getHex(hex).object.setStatus(pad.status),
      ),
    )
  }
}
