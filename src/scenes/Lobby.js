import { Button } from '../entities/Button'

const { clientWidth: width, clientHeight: height } = document.documentElement
export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Lobby' })
  }

  create() {
    const enterRoom = (room, name) => {
      localStorage.setItem('name', name)
      localStorage.setItem(room.id, room.sessionId)
      clearInterval(this.interval)
      this.scene.start('Game', { room })
    }

    this.createRoomFast = async (name) => {
      const colyseus = window.colyseus
      const room = await colyseus.create('rivals', {
        roomName: 'asd',
        name: 'name',
      })
      enterRoom(room, name)
    }

    this.createRoom = async (name) => {
      const roomName = prompt('Room name?')
      if (!roomName) return

      const colyseus = window.colyseus
      const room = await colyseus.create('rivals', { roomName, name })
      enterRoom(room, name)
    }

    this.joinRoom = async (roomId, name) => {
      try {
        const room = await joinRoomWithReconnect(roomId, name)
        if (!room) throw new Error('Failed to join room')
        enterRoom(room, name)
      } catch (e) {
        alert(e)
        localStorage.removeItem(roomId)
      }
    }

    let roomButtons = []
    const onFetchRooms = (rooms = []) => {
      roomButtons.forEach((b) => b.destroy())
      rooms.forEach((room, i) => {
        roomButtons.push(
          new Button(
            this,
            width / 2,
            height - 400 - 100 * i,
            () => this.joinRoom(room.roomId, 'name'),
            room.metadata.roomName || room.roomId,
          ),
        )
      })

      if (!rooms) return
      const lastRoom = rooms.find((room) => localStorage.getItem(room.roomId))
      if (lastRoom) this.joinRoom(lastRoom.roomId, name)
    }

    window.colyseus.getAvailableRooms().then(onFetchRooms)
    this.interval = setInterval(() => {
      window.colyseus.getAvailableRooms().then(onFetchRooms)
    }, 3000)

    new Button(
      this,
      width / 2,
      height - 200,
      this.createRoomFast,
      'Create Game',
    )
  }
}

const joinRoomWithReconnect = async (roomId, name) => {
  let room,
    sessionId = localStorage.getItem(roomId)

  if (sessionId) {
    try {
      room = await window.colyseus.reconnect(roomId, sessionId)
    } catch (e) {}
  } else {
    room = room || (await window.colyseus.joinById(roomId, { name }))
  }

  return room
}
