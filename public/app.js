let socket = io();

// selection 
const nameform = document.getElementById("name_form")
const room = document.querySelector(".room")

const formArea = document.querySelector(".name")
const onlineUserList = document.getElementById("onlineUserList")
const innerCanvas = document.querySelector('.inner_canvas')
const displayName = document.querySelector(".displayNmae")
const messages = document.querySelector(".messages")
const msgForm = document.getElementById("msg_form")


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
    const receiverId = msgForm[1].value
    const senderId = socket.id

    if (msg) {
        socket.emit('send_a_msg', { msg, receiverId, senderId }, () => {

            showMessageUI(msg, 'You')



            msgForm[0].value = ' '

        })


    }


})


// receiving private message

socket.on('receive_msg', (data, name) => {
    console.log('data',data)
    console.log(data.senderId)
    // console.log(senderId)


    // const user=activeUser.find(u=>u.id)
    innerCanvas.hidden = false
    displayName.innerText = name
    msg_form[1].value = data.senderId
    

    showMessageUI(data.msg,name)




})



const showMessageUI = (msg,name) => {
    if (name === 'You') {
        const li = document.createElement('li')
        li.innerText = `${name} : ${msg}`
        messages.appendChild(li)
    }
    else {
        const li = document.createElement('li')
        li.innerText = `${name} : ${msg}`
        messages.appendChild(li)

    }







}





















