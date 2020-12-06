import Phaser from 'phaser'
import * as scenes from './scenes'
import { Client } from 'colyseus.js'
import { HEIGHT, WIDTH } from '../lib/constants'

window.colyseus = new Client(
  process.env.NODE_ENV === 'production'
    ? 'wss://daniel-chess.herokuapp.com'
    : 'ws://localhost:3553',
)

const game = new Phaser.Game({
  transparent: true,
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: WIDTH,
  height: HEIGHT,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: Object.values(scenes),
})

export default game
