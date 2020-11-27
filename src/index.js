import Phaser from 'phaser'
import * as scenes from './scenes'

const game = new Phaser.Game({
  transparent: true,
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 200,
  height: 200,
  pixelArt: true,
  zoom: 20,
  input: { activePointers: 3 },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: Object.values(scenes),
})

export default game
