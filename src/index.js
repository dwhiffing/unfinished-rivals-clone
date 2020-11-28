import Phaser from 'phaser'
import * as scenes from './scenes'
import { Client } from 'colyseus.js'

window.colyseus = new Client(
  process.env.NODE_ENV === 'production'
    ? 'wss://daniel-chess.herokuapp.com'
    : 'ws://localhost:3553',
)

const width = document.documentElement.clientWidth
const height = document.documentElement.clientHeight

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
