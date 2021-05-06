
class Actor {
    constructor() {
        this.videoIDs = [[id, startTime]];
    }
}


//loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '500',
        width: '100%',
        videoId: 'M7lc1UVf-VE',
        playerVars: {
            'playsinline': 1
        },
        // events: {
        //     'onReady': onPlayerReady,
        //     'onStateChange': onPlayerStateChange
        // }
    });
}

// 4. The API will call this function when the video player is ready.
// function onPlayerReady(event) {
//     event.target.playVideo();
// }

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// var done = false;
// function onPlayerStateChange(event) {
//     if (event.data == YT.PlayerState.PLAYING && !done) {
//         setTimeout(stopVideo, 6000);
//         done = true;
//     }
// }
function stopVideo() {
    player.stopVideo();
}


//When actor is clicked on video will start at certain time
function playActorVideo(actor, time) {
    //playVideo(id, time - startTime of video)

}

//plays video in youtube iframe with video starting at time start
//time start in seconds
function playVideo(id, timeStart) {
    player.loadVideoById(id, timeStart);
}