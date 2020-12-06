import { type, ArraySchema, Schema } from '@colyseus/schema'
import { Coord } from './Coord'

export class Unit extends Schema {
  @type('number')
  id

  @type('number')
  x

  @type('number')
  y

  @type('number')
  gridX

  @type('number')
  gridY

  @type('number')
  team

  @type('number')
  damage

  @type(Coord)
  destination

  @type('number')
  target

  @type('number')
  health

  @type('number')
  speed

  @type('number')
  fireRateCounter

  @type('number')
  fireRate

  @type([Coord])
  path = new ArraySchema<Coord>()

  constructor(args) {
    super()
    this.id = args.id
    this.gridX = args.gridX
    this.gridY = args.gridY
    this.team = args.team
    this.health = args.health
    this.damage = args.damage
    this.speed = args.speed
    this.target = args.target
    this.fireRate = args.fireRate
    this.fireRateCounter = args.fireRateCounter
    this.x = args.x
    this.y = args.y
    this.path = args.path.map((p) => new Coord(p))
    this.destination = args.destination ? new Coord(args.destination) : null
  }
}
