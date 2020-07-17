const socket = io()

//elements
const $messageForm = document.querySelector('#chat-form')
const $messageFormInput = document.querySelector('#message-text')
const $messageFormButton = document.querySelector('#message-button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templetes
const messageTemplete = document.querySelector('#message-templete').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-templete').innerHTML
const sidebarTemplet = document.querySelector('#sidebar-templete').innerHTML

//Options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll = () =>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetsHeight + newMessageMargin
    
    //visible Height
    const visibleHeight = $messages.offsetsHeight
    
    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplete,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room,users}) =>{
    const html = Mustache.render(sidebarTemplet,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#chat-form').addEventListener('submit',(e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    socket.emit('userMessage',$messageFormInput.value,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
})

document.querySelector('#send-location').addEventListener('click',() =>{
    //disable the button
    $sendLocationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('userLocation',{
            lat:position.coords.latitude,
            long:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join',{username , room},(error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})