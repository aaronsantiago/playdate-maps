const URL = "http://localhost:3000";
const socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('messenger');
var input = document.getElementById('messageInput');


form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});


// function scrollIt() {
//     const scrollElement = 
//     document.getElementById('messagesContainer').SimpleBar.getScrollElement();
//     scrollElement.scrollTop = 1200;
// }
socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    $('.simplebar-content-wrapper').scrollTop($('#messages').height());
});

socket.onAny((event, ...args) => {
    console.log(event, args);
});


function onUsernameSelection(username) {
    this.usernameAlreadySelected = true;
    socket.auth = { username };
    socket.connect();
}