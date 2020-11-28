const { clientWidth, clientHeight } = document.documentElement

export const WIDTH = 11
export const HEIGHT = 7

export const ABSOLUTE_TILE_SIZE = 225
export const HEX_SIZE_TO_HEIGHT_RATIO = 1.582
export const HEX_SIZE_TO_WIDTH_RATIO = 1.7321
export const TILE_SIZE = clientWidth / (WIDTH * HEX_SIZE_TO_WIDTH_RATIO)
export const TILE_HEIGHT = TILE_SIZE * HEX_SIZE_TO_HEIGHT_RATIO
export const OFFSET_Y = (clientHeight - TILE_HEIGHT * HEIGHT) / 2
export const SCALED_TILE_SIZE = TILE_SIZE / ABSOLUTE_TILE_SIZE
