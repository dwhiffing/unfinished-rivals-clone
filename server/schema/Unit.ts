import { type, ArraySchema, Schema } from '@colyseus/schema'

class Coord extends Schema {
  @type('number')
  x

  @type('number')
  y

  constructor({ x = 0, y = 0 } = {}) {
    super()
    this.x = x
    this.y = y
  }
}

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
  health

  @type('number')
  speed

  @type([Coord])
  path = new ArraySchema<Coord>()

  constructor({
    id,
    x,
    y,
    gridX,
    gridY,
    path,
    destination,
    team,
    health,
    damage,
    speed,
  }) {
    super()

    this.id = id
    this.gridX = gridX
    this.gridY = gridY
    this.team = team
    this.health = health
    this.damage = damage
    this.speed = speed
    this.x = x
    this.y = y
    this.path = path.map((p) => new Coord(p))
    this.destination = destination ? new Coord(destination) : null
  }
}
