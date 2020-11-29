export const WIDTH = 12
export const HEIGHT = 7
export const HEX_WIDTH_RATIO = 1.7321
export const HEX_HEIGHT_RATIO = 1.582
export const ABSOLUTE_TILE_SIZE = 225
export const HEX_SPRITE_WIDTH = 392
export const HEX_SPRITE_HEIGHT = 452
export const UNITS = [
  { gridX: 2, gridY: 2, team: 0 },
  { gridX: 2, gridY: 1, team: 0 },
  { gridX: 1, gridY: 3, team: 0 },
  { gridX: 8, gridY: 1, team: 1 },
  { gridX: 9, gridY: 2, team: 1 },
  { gridX: 9, gridY: 3, team: 1 },
]
// export const UNITS = [
//   { gridX: 4, gridY: 2, team: 0 },
//   { gridX: 5, gridY: 2, team: 1 },
// ]
export const MAP = [
  // left base
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
  [0, 2, 1],
  [1, 2, 1],

  // left rocks
  [0, 4, 1],
  [0, 5, 1],
  [0, 6, 1],
  [1, 6, 1],

  // right base
  [10, 0, 1],
  [11, 0, 1],
  [9, 1, 1],
  [10, 1, 1],
  [11, 1, 1],
  [10, 2, 1],
  [11, 2, 1],

  // right rocks
  [11, 3, 1],
  [11, 4, 1],
  [10, 5, 1],
  [11, 5, 1],
  [10, 6, 1],
  [11, 6, 1],

  // middle rocks
  [3, 2, 1],
  [2, 3, 1],
  [5, 3, 1],
  [5, 5, 1],
  [8, 2, 1],
  [8, 3, 1],

  // resources
  [3, 5, 2],
  [2, 5, 2],
  [3, 6, 2],
  [4, 6, 2],
  [8, 5, 2],
  [7, 5, 2],
  [8, 6, 2],
  [7, 6, 2],

  // pads
  [4, 3, 3],
  [3, 3, 3],
  [4, 2, 3],
  [7, 3, 3],
  [6, 3, 3],
  [7, 2, 3],
]
