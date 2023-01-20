let socket = io();

// selection 
const nameform = document.getElementById("name_form")
const createRoomInput = document.getElementById("create_room")
const roomButton = document.getElementById("create-btn")
const room = document.querySelector(".room")

const formArea = document.querySelector(".name")
const onlineUserList = document.getElementById("onlineUserList")
const innerCanvas = document.querySelector('.inner_canvas')
const displayName = document.querySelector(".displayNmae")
const messages = document.querySelector(".messages")
const modal = document.querySelector(".modal")
const msgForm = document.getElementById("msg_form")

const roomAccordian = document.getElementById("accordionPanelsStayOpenExample")


// global variables 
let activeUser

//   set user name 

nameform.addEventListener('submit', (e) => {
    e.preventDefault()


    const name = nameform[0].value

    if (!name) return

    socket.emit('setName', name, () => {
        formArea.hidden = true
        room.hidden = false




    })

})


// active users  list

socket.on('activeUser', (users) => {
    activeUser = users

    // reset div 


    onlineUserList.innerHTML = ' '

    users.forEach(user => {

        const li = document.createElement('li')
        li.style.cursor = 'pointer'
        li.addEventListener('click', () => {
            if (user.id === socket.id) {

                messages.innerHTML = ' '

                innerCanvas.hidden = true

                msgForm[1].value = ' '
                return

            }

            // reset previous message 

            messages.innerHTML = ' '

            innerCanvas.hidden = false
            displayName.innerText = user.name
            msgForm[1].value = user.id
            msgForm[1].dataset.room = false

        })

        li.textContent = user.id === socket.id ? 'You' : user.name
        li.dataset.id = user.id
        onlineUserList.append(li)
        li.classList.add('list-group-item')
        li.classList.add('onLine')


    })



})

//  sending private message


msgForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const isRoom = msgForm[1].dataset.room
    if (isRoom) {
        const msg = msgForm[0].value
        const id = msgForm[1].value

        if (msg) {
            socket.emit('send_a_msg', { msg, id, isRoom }, () => {

                showMessageUI(msg, 'You')
                msgForm[0].value = ' '

            })


        }
        else {
            return
        }


    }
    else {
        const msg = msgForm[0].value
        const id = msgForm[1].value



        if (msg) {
            socket.emit('send_a_msg', { msg, id, isRoom }, () => {

                showMessageUI(msg, 'You')
                msgForm[0].value = ' '

            })


        }

    }





})


// receiving private message

socket.on('receive_msg', (data, name, senderId) => {

    console.log(data)


    if (data.isRoom) {
        console.log(data)
        console.log('I am from room inside')

        innerCanvas.hidden = false
        displayName.innerText = data.id
        msgForm[1].value = data.id
        msgForm[1].dataset.room = data.id
        showMessageUI(data.msg, name)


    }
    else {



        innerCanvas.hidden = false
        displayName.innerText = name
        msgForm[1].value = senderId
        msgForm[1].dataset.room = false


        showMessageUI(data.msg, name)

    }



})



const showMessageUI = (msg, name) => {
    if (name === 'You') {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.innerText = `${name} : ${msg}`
        messages.appendChild(li)
    }
    else {
        const li = document.createElement('li')
        li.innerText = `${name} : ${msg}`
        messages.appendChild(li)

    }


}


// create room 

roomButton.addEventListener('click', () => {
    const roomName = createRoomInput.value

    if (roomName) {

        socket.emit('create_room', roomName, () => {


        })
        modalClose()

    }


})


// show public rooms 
socket.on('getPublicRooms', (rooms) => {

    console.log(rooms)
    showPublicRoom(rooms)

})


function showPublicRoom(rooms) {
    roomAccordian.innerHTML = ' '
    const singleroom = document.createElement("div");
    singleroom.classList.add("accordion-item");
    rooms.forEach(room => {
        const singleroom = document.createElement("div");
        singleroom.classList.add("accordion-item");
        singleroom.innerHTML = `
        <h2 class="accordion-header" id="${room.id}id">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#${room.id}option"
                  aria-expanded="false"
                  aria-controls="${room.id}option"
                  
                >
                  ${room.name} (${room.size})
                  <span onclick="joinRoom('${room.name}')"  class="material-symbols-outlined">
                      group_add
                  </span>
                  <span onclick="leaveRoom('${room.name}')"  class="material-symbols-outlined">
                      logout
                  </span>
                  
                
                </button>
              </h2>
              <div
              id="${room.id}option"
              class="accordion-collapse collapse"
              aria-labelledby="${room.id}id"
            >
              <div class="accordion-body">
                <ul id="participants"> </ul>
              </div>
            </div>`;
        const participants = singleroom.querySelector("#participants");
        room?.perticipants.forEach(participant => {
            const li = document.createElement("li");
            li.textContent = participant.name;
            participants.appendChild(li);
        });

        roomAccordian.appendChild(singleroom);






    })

}

// join a room 

const joinRoom = (roomName) => {
    socket.emit('join-to-room', roomName, () => {
        innerCanvas.hidden = false
        displayName.textContent = roomName
        msgForm[1].value = roomName
        msgForm[1].dataset.room = true
        messages.innerHTML = ' '

    })


}

const leaveRoom = (roomName) => {

    socket.emit('leave-room', roomName, () => {
        innerCanvas.hidden = true
        messages.innerHTML = ' '

    })



}







// modal close 

function modalClose() {
    modal.classList.remove('show')
    modal.style.dispay = 'none'
    createRoomInput.value = ' '
    document.body.classList.remove('modal-open')
    document.body.style = {}
    document.querySelector('.modal-backdrop')?.remove('show')


}


























