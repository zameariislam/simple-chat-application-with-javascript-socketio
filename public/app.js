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

                msg_form[1].value = ' '
                return

            }

            // reset previous message 

            messages.innerHTML = ' '

            innerCanvas.hidden = false
            displayName.innerText = user.name
            msg_form[1].value = user.id

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
    const msg = msgForm[0].value
    const id = msgForm[1].value

    const senderId = socket.id

    if (msg) {
        socket.emit('send_a_msg', { msg, id }, () => {

            showMessageUI(msg, 'You')
            msgForm[0].value = ' '

        })


    }


})


// receiving private message

socket.on('receive_msg', (data, name, senderId) => {


    // const user=activeUser.find(u=>u.id)
    innerCanvas.hidden = false
    displayName.innerText = name
    msg_form[1].value = senderId


    showMessageUI(data.msg, name)


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
            console.log('created')

        })
        modalClose()

    }


})


// get public rooms 

socket.on('getPublicRooms', (publicRooms) => {

    publicRooms.forEach(room => {
        const accordionItem = document.createElement('div')
        accordionItem.classList.add("accordion-item")
        accordionItem.innerHTML = `
        <h2 class="accordion-header" id=${room.id}>
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
        ${room.name}
      </button>
    </h2>
    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
      </div>
    </div>


        `




    })

})

// modal close 

function modalClose(){
    modal.classList.remove('show')
    modal.style.dispay='none'
    createRoomInput.value=' '
    document.body.classList.remove('modal-open')
    document.body.style={}
    document.querySelector('.modal-backdrop')?.remove('show')
    

}


























