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

    // set name 

    socket.on('setName', async (name, cb) => {

        socket.name = name
        cb()
        const activeUser = await getOnlineUsers()
        console.log(activeUser)


        // to all connected clients


        io.emit('activeUser', activeUser);






    })


    // listen a message 

    socket.on('send_a_msg', (data, cb) => {
        
        console.log(data)

        // to individual socketid (private message)
        // console.log('senderId',socket.id)

        io.to(data.receiverId).emit('receive_msg', data,socket.name);

        cb()


    })

    // discoonect 

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        const activeUser = await getOnlineUsers()
        console.log(activeUser)


        // to all connected clients
        io.emit('activeUser', activeUser);
    });
})



server.listen(3000, () => {
    console.log('listening on *:3000');
});