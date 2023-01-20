const express = require('express');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.use(express.static('public'))



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/room.html');
});

io.on('connection', (socket) => {
    console.log('user connected')

    // get Online Users 

    const getOnlineUsers = async () => {
        const activeUserSockets = io.sockets.sockets


        const sids = io.sockets.adapter.sids
        const activeUserArray = [...sids.keys()]
        const activeUser = []

        activeUserArray.forEach(userId => {
            const userSocket = activeUserSockets.get(userId)
            if (userSocket.name) {
                const user = {
                    id: userSocket.id,
                    name: userSocket.name
                }
                activeUser.push(user)
            }

        })

        return activeUser

    }

    // get Public rooms

    const getPublicRooms = async () => {

        // all rooms 
        const rooms = await io.sockets.adapter.rooms
        console.log(rooms.keys())

        // all socketId

        const sids = await io.sockets.adapter.sids
        // all sockets 
        const allSockets = await io.sockets.sockets
        console.log(allSockets)

        const roomArray = [...rooms.keys()]

        const sidArray = [...sids.keys()]
        console.log('room', rooms)
        console.log('sids', sids)

        const publicRoom = []

        let roomId = 0

        for (let room of roomArray) {
            if (!sidArray.includes(room)) {

                const perticipantSet = rooms.get(room)
                const size = perticipantSet.size
                const roomMember = []

                for (let perticipant of [...rooms.get(room)]) {
                    const userSocket = allSockets.get(perticipant)
                    roomMember.push({
                        id: userSocket.id,
                        name: userSocket.name

                    })

                }
                publicRoom.push({
                    name: room,
                    id: 'zzz' + roomId + Date.now(),
                    size,
                    perticipants: roomMember




                })


            }
            ++roomId


        }
        return publicRoom





    }




    // set name 

    socket.on('setName', async (name, cb) => {


        socket.name = name
        cb()
        const activeUser = await getOnlineUsers()

        const rooms = await getPublicRooms()



        io.emit('getPublicRooms', rooms)



        // to all connected clients


        io.emit('activeUser', activeUser);






    })

    // crate a public room
    socket.on('create_room', async (name, cb) => {
        socket.join(name)
        const rooms = await getPublicRooms()
        // console.log(rooms)
        io.emit('getPublicRooms', rooms)

        cb()
    })

    // join to a room 
    socket.on('join-to-room', async (name, cb) => {
        socket.join(name)
        const rooms = await getPublicRooms()

        io.emit('getPublicRooms', rooms)
        cb()

    })



    // listen a message 

    socket.on('send_a_msg', (data, cb) => {
       

        const isRoom = data.isRoom === 'false' ? false : data.isRoom
        data.isRoom = isRoom


        console.log(data)
    

        // to individual socketid (private message)
        // console.log('senderId',socket.id)

        if (isRoom) {
            console.log(data.id)
            console.log('I am from room')
            socket.to(data.id).emit('receive_msg',data,socket.name )
          
            cb()
           
        }
        else{
            console.log('I am not from room')
            io.to(data.id).emit('receive_msg', data, socket.name, socket.id);
            cb()
            
           
           
        }
   


    })

    // leave a room 

    socket.on('leave-room',async (name,cb)=>{
        socket.leave(name)
        const rooms = await getPublicRooms()

        io.emit('getPublicRooms', rooms)
        cb()


    })

    // discoonect 

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        const activeUser = await getOnlineUsers()
        // console.log(activeUser)

        const rooms = await getPublicRooms()
        // console.log(rooms)
        io.emit('getPublicRooms', rooms)


        // to all connected clients
        io.emit('activeUser', activeUser);
    });
})



server.listen(3000, () => {
    console.log('listening on *:3000');
});