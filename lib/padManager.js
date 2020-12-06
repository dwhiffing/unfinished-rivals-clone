export class PadManager {
  constructor(strategyGame) {
    this.strategyGame = strategyGame
    this.pads = []
    this.chargeIndex = -1
    this.charge = 0
  }

  tick = () => {
    if (this.strategyGame.phaseIndex !== 0) return

    this.pads = this._getPads()
    this.chargeIndex = this._getChargeIndex()
    this.charge = this._getCharge()
  }

  _getChargeIndex = () => {
    const leftCount = this.pads.filter((p) => p.status === 0).length
    const rightCount = this.pads.filter((p) => p.status === 1).length
    const tieCount = this.pads.filter((p) => p.status === 2).length
    if (
      (leftCount > 0 && rightCount > 0 && rightCount === leftCount) ||
      (tieCount > leftCount && tieCount > rightCount)
    ) {
      return 2
    } else if (leftCount > rightCount) {
      return 0
    } else if (rightCount > leftCount) {
      return 1
    }
    return -1
  }

  _getCharge = () => {
    if (this.chargeIndex !== 0 && this.chargeIndex !== 1) return this.charge
    if (this.charge >= 99) {
      const otherPlayer = this.strategyGame.players.find(
        (p) => p.team !== this.chargeIndex,
      )
      otherPlayer.health -= 50
      this.charge = 0

      if (otherPlayer.health <= 0) {
        this.strategyGame.phaseIndex = 1
      }
      return 0
    }

    return this.charge + 1
  }

  _getPads = () => {
    let pads = []
    this.strategyGame.hexes.hexGrid
      .filter((h) => h.index === 3)
      .forEach((hex) => {
        const neighbours = this.strategyGame.hexes.hexGrid.neighborsOf(hex)
        const connectedPad = pads.find((pad) =>
          pad.some((h) => neighbours.includes(h)),
        )
        if (connectedPad) {
          connectedPad.push(hex)
        } else {
          pads.push([hex])
        }
      })

    return pads.map((hexes) => {
      let status = -1
      let leftIsPresent = hexes.some((h) => h.unit?.team === 0)
      let rightIsPresent = hexes.some((h) => h.unit?.team === 1)
      if (leftIsPresent) status = 0
      if (rightIsPresent) status = 1
      if (leftIsPresent && rightIsPresent) status = 2
      return { status, hexes }
    })
  }
}
