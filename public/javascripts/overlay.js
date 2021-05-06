
$(document).ready(function () {
    console.log("hello")
    new SimpleBar(document.getElementById('messagesContainer'));
});

let overlayOpen = false;

function toggleOpen() {
    if (overlayOpen) {
        closeOverlay();
    } else {
        openOverlay();
    }
}

function openOverlay() {
    overlayOpen = true;
    document.getElementById('layover').style.transform = "translate(0%, 0%)";
    document.getElementById('tabArrow').style.transform = "rotate(180deg)";
}

function closeOverlay() {
    overlayOpen = false;
    document.getElementById('layover').style.transform = "translate(-100%, 0%)";
    document.getElementById('tabArrow').style.transform = "rotate(0deg)";
}