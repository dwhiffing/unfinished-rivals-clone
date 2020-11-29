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
        ...this.state.strategyGame.hexes.map((h) => new Hex(h)),
      )
    }

    let shouldUpdateUnits =
      this.state.units.length !== strat.units.length ||
      this.state.units.some((unit) => {
        const u = strat.getUnit(unit.id)
        return unit.x !== u.x || unit.y !== u.y
      })

    if (shouldUpdateUnits) {
      this.state.units = new ArraySchema<Unit>(
        ...strat.units.map((u) => new Unit(u)),
      )

      this.state.pads = new ArraySchema<Pad>(
        ...strat.pads.map((ps) => new Pad(ps)),
      )
    }
  }
}
