import * as constants from '../lib/rivals'

export const getScreenPos = (position) => {
  const x = position.x + (392 * constants.SCALED_TILE_SIZE) / 2
  const y =
    position.y + (452 * constants.SCALED_TILE_SIZE) / 2 + constants.OFFSET_Y

  return { x, y }
}
