import { ArraySchema } from '@colyseus/schema'
import { Command } from '@colyseus/command'
import { Hex, Pad, RoomState, Unit } from '../schema'

export class SyncCommand extends Command<RoomState> {
  execute() {
    const strat = this.state.strategyGame
    this.state.charge = strat.charge
    this.state.phaseIndex = strat.phaseIndex
    this.state.chargeIndex = strat.chargeIndex

    if (!this.state.hexes) {
      this.state.hexes = new ArraySchema<Hex>(
        ...this.state.strategyGame.hexes.hexGrid.map((h) => new Hex(h)),
      )
    }

    let shouldUpdatePads =
      this.state.pads.length !== strat.pads.length ||
      this.state.pads.some(
        (pad, index) => strat.pads[index].status !== pad.status,
      )

    if (shouldUpdatePads) {
      this.state.pads = new ArraySchema<Pad>(
        ...strat.pads.map((ps) => new Pad(ps)),
      )
    }

    let shouldUpdateUnits =
      this.state.units.length !== strat.units.length ||
      this.state.units.some((unit) => {
        const u = strat.units.find((u) => u.id === unit.id)
        return (
          unit.x !== u.x ||
          unit.y !== u.y ||
          unit.destination !== u.destination ||
          unit.health !== u.health ||
          unit.path.length !== u.path.length
        )
      })
    if (shouldUpdateUnits) {
      this.state.units = new ArraySchema<Unit>(
        ...strat.units.map((u) => new Unit(u)),
      )
    }
  }
}
