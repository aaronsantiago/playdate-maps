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

socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
});

socket.onAny((event, ...args) => {
    console.log(event, args);
});


function onUsernameSelection(username) {
    this.usernameAlreadySelected = true;
    socket.auth = { username };
    socket.connect();
}