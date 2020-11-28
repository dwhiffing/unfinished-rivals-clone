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
      this.scene.start('Game')
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

    new Button(this, width / 2, height - 200, this.createRoom, 'Create Game')
  }

  update(time, delta) {}
}

// export function Lobby({ setRoom }) {
// const getAvailableRooms = useCallback(
//   async () => setAvailableRooms(await window.colyseus.getAvailableRooms()),
//   [],
// )
// useEffect(() => {
//   getAvailableRooms()
//   intervalRef.current = setInterval(getAvailableRooms, 3000)
//   return () => clearInterval(intervalRef.current)
// }, [getAvailableRooms])
// useEffect(() => {
//   if (!availableRooms) return
//   const lastRoom = availableRooms.find((room) =>
//     localStorage.getItem(room.roomId),
//   )
//   if (lastRoom && !autoConnectAttempted.current) {
//     autoConnectAttempted.current = true
//     joinRoom(lastRoom.roomId, name)
//   }
// }, [availableRooms, joinRoom, name])
// return (
//   <Flex variant="column center" style={{ height: '100vh' }}>
//     <TextField
//       placeholder="Enter name"
//       value={name}
//       style={{ marginBottom: 20 }}
//       onChange={(e) => setName(e.target.value)}
//     />
//     <Typography variant="h5">Available Tables:</Typography>
//     <Flex flex={0} variant="column center" style={{ minHeight: 200 }}>
//       {availableRooms.length === 0 && (
//         <Typography>No rooms available</Typography>
//       )}
//       {availableRooms.map((room) => (
//         <RoomListItem
//           key={room.roomId}
//           room={room}
//           onClick={() => joinRoom(room.roomId, name)}
//         />
//       ))}
//     </Flex>
//     <Action onClick={() => createRoom(name)}>Create room</Action>
//   </Flex>
// )
// }

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

class Button extends Phaser.GameObjects.Sprite {
  onInputOver = () => {}
  onInputOut = () => {}
  onInputUp = () => {}

  constructor(
    scene,
    x,
    y,
    actionOnClick = () => {},
    label = '',
    texture = 'button',
    overFrame = 0,
    outFrame = 0,
    downFrame = 1,
  ) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    this.text = scene.add.text(this.x, this.y, label)

    this.setFrame(outFrame)
      .setInteractive()

      .on('pointerover', () => {
        this.onInputOver()
        this.setFrame(overFrame)
      })
      .on('pointerdown', () => {
        actionOnClick()
        this.setFrame(downFrame)
      })
      .on('pointerup', () => {
        this.onInputUp()
        this.setFrame(overFrame)
      })
      .on('pointerout', () => {
        this.onInputOut()
        this.setFrame(outFrame)
      })
  }

  destroy() {
    this.text.destroy()
    super.destroy()
  }
}
