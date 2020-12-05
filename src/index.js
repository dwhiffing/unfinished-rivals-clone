import Phaser from 'phaser'
import * as scenes from './scenes'
import { Client } from 'colyseus.js'
import { NATIVE_HEIGHT, NATIVE_WIDTH } from '../lib/constants'

window.colyseus = new Client(
  process.env.NODE_ENV === 'production'
    ? 'wss://daniel-chess.herokuapp.com'
    : 'ws://localhost:3553',
)

const width = NATIVE_WIDTH
const height = NATIVE_HEIGHT

const game = new Phaser.Game({
  transparent: true,
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width,
  height,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: Object.values(scenes),
})

export default game
