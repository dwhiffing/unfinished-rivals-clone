import * as constants from './constants'

export const getScreenPos = (position) => {
  const x = position.x + (392 * constants.SCALED_TILE_SIZE) / 2
  const y =
    position.y + (452 * constants.SCALED_TILE_SIZE) / 2 + constants.OFFSET_Y

  return { x, y }
}

export const getPath = (scene, start, end) => {
  let candidates = [start]
  let path = []
  while (candidates.length > 0) {
    candidates = candidates.sort((a, b) => {
      const g1 = a.distance(start)
      const h1 = a.distance(end)
      const f1 = g1 + h1
      const g2 = b.distance(start)
      const h2 = b.distance(end)
      const f2 = g2 + h2
      return f1 == f2 ? h1 - h2 : f1 - f2
    })
    let current = candidates.shift()

    path.push(current)
    if (current === end) return path

    const neighbours = scene.hexService.hexGrid
      .neighborsOf(current)
      .filter((h) => !!h && !candidates.includes(h))
    candidates = candidates.concat(neighbours)
  }

  return path
}
