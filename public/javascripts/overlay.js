
$(document).ready(function () {
    console.log("hello")
    new SimpleBar(document.getElementById('messagesContainer'));
});


function toggleOpen() {
    if (document.getElementById('layover').style.transform === "translate(0%, 0%)") {
        closeOverlay();
    } else {
        openOverlay();
    }
}

function openOverlay() {
    document.getElementById('layover').style.transform = "translate(0%, 0%)";
    document.getElementById('tabArrow').style.transform = "rotate(180deg)";
}

function closeOverlay() {
    document.getElementById('layover').style.transform = "translate(-100%, 0%)";
    document.getElementById('tabArrow').style.transform = "rotate(0deg)";
}