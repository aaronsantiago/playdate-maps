// globals
let baseHours = 14;
let baseMinutes = 13;
let stallTime = 3;
let endTime = 100;

let hideBarWaitSeconds = 2;
let hideBarTimer = 0;
let isMouseInControls = false;

var leftMouseButtonOnlyDown = false;

$( "#timeline" ).hover(function() {
      isMouseInControls = true;
    }, function() {
      isMouseInControls = false;
    });

function setLeftButtonState(e) {
  leftMouseButtonOnlyDown = e.buttons === undefined 
    ? e.which === 1 
    : e.buttons === 1;
}

document.body.onmousedown = setLeftButtonState;
document.body.onmousemove = setLeftButtonState;
document.body.onmouseup = setLeftButtonState;

function toggleFullscreen() {
  if (document.fullscreenElement != null) {
    document.exitFullscreen();
  }
  else {
    document.body.requestFullscreen();
  }
}

function pause() {
  playing = false;
}

function play() {
  playing = true;
}

// playback toggle button
function togglePlayback() {
  playing = !playing;
}

// actor focus clear 
function clearFocus() {
  actorFocus = "";
}

// playback range slider
$("#playbackSpeed")
    .slider({ 
      min: 1, 
      max: 600, 
      step: 1
    })                 
    .slider("pips", {
        rest: "label",
        step: 100
    });
$("#slider")
    .slider({ 
      min: 0, 
      max: 95, 
      step: .001 
    })                 
    .slider("pips", {
        rest: "label",
        step: 5000
    });
      
$("#slider").slider({
    slide: function(event, ui) {
      currentPlayPosition = ui.value;
    }
});
$("#playbackSpeed").slider({
    slide: function(event, ui) {
      playbackSpeed = ui.value;
    }
});

function toggleTimeline() {
  $("#timeline").toggle();
}

// playback variables
let playing = false;
let actorFocus = "";
let playbackSpeed = 60;
let playbackLength = 1; // use placeholder length until we calculate the true length
let currentPlayPosition = 0;



// mapbox setup

mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb25kb3R3b3JrIiwiYSI6ImNrZjB5aGFkMzBxNzEycmxjZ3B3Zzh1MmYifQ.nO9RZS54KUxX_Xm-0Yr9iA';
let mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
let mapOptions = {
  container: 'map',
  style: 'mapbox://styles/aarondotwork/ckh5ea27b07yt19o7ydmuikir',
  center: [-73.99042372887936, 40.692302258434665],
  zoom: 16
};
let map = null;

let journeys = {}; // stores parsed actor path journeys
let animations = []; // used to hold actor render functions

let currentIteration = -1; // used to reset state when JSON is refreshed
let jsonToMap = function() {
  currentIteration++;
  if (map != null) map.remove();
  map = new mapboxgl.Map(mapOptions);
  map.on('drag', function() {
    clearFocus();
  });
  map.on('mousemove', function() {
    hideBarTimer = 0;
  });
  for (let name in journeys) {
    let journey = journeys[name];

    // process individual locations per journey
    for (let leg of journey) {
      if (isNaN(leg.stayDuration)) leg.stayDuration = 0;
      let id = 'point' + Math.random();

      let point = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Point',
            'coordinates': leg.coordinates
          }
        }]
      };


      // // optionally add them to the map
      // let onLoad = () => {
      //   let marker = new mapboxgl.Marker()
      //     .setLngLat(leg.coordinates)
      //     .addTo(map);
      // };
      // if (!map.loaded()) {
      //     map.on('load', onLoad);
      // }
      // else {
      //     onLoad();
      // }
    }

    // ping mapbox for directions between each destination
    let routes = [];
    let numRoutesFilled = 0;
    let myIteration = currentIteration;
    for (let i = 1; i < journey.length; i++) {
      routes.push[{}];
      mapboxClient.directions.getDirections({
          profile: 'walking',
          geometries: 'geojson',
          waypoints: [
            journey[i - 1],
            journey[i],
          ]
        })
        .send()
        .then((response) => {
          const directions = response.body;

          // pass metadata from raw JSON through to the individual
          // routes
          let routeGeometry = directions.routes[0].geometry;
          routeGeometry.waypoint = journey[i - 1].coordinates;
          routeGeometry.time = journey[i - 1].time;
          routeGeometry.duration = journey[i].time - journey[i - 1].time - journey[i - 1].stayDuration;
          routeGeometry.stayDuration = journey[i - 1].stayDuration;
          routeGeometry.interior = journey[i - 1].interior;


          if (routeGeometry.duration < 0) {
            console.log("incorrect formatting for time: " + name);
          }
          if (routeGeometry.duration < routeGeometry.stayDuration) {
            console.log("incorrect formatting for stayDuration: " + name)
          }

          routes[i - 1] = routeGeometry;
          numRoutesFilled += 1;

          // finalization routine when all routes have been received
          if (numRoutesFilled >= journey.length - 1) {
            let actor = new ActorPath(map, name);
            for (let route of routes) {
              actor.addGeometry(route);
            }
            actor.finalize();
            // update playback duration to longest actor duration
            if (actor.totalDuration > playbackLength) {
              playbackLength = actor.totalDuration;
            }

            function animate() {
              // make sure to bail if app has been reloaded
              if (myIteration != currentIteration) return;
              actor.render(currentPlayPosition - stallTime);

              if (actorFocus == name && !leftMouseButtonOnlyDown) {
                map.flyTo({
                  center: actor.point.features[0].geometry.coordinates,
                  essential: true, // this animation is considered essential with respect to prefers-reduced-motion
                  duration: 0
                });
              }
            }
            animations.push(animate);
          }
        });
    }
  }
}

let previousTime = Date.now();
// update all actor animation functions
function animateAll() {

  // ensure deltaTime calculations still happen when playback
  // is not running
  let currentTime = Date.now();
  let deltaTime = (currentTime - previousTime) / 1000;
  if (!isMouseInControls) hideBarTimer += deltaTime;
  if (hideBarTimer < hideBarWaitSeconds) {
    $("#timeline").removeClass("hidden").addClass("visible");
  }
  else {
    $("#timeline").removeClass("visible").addClass("hidden");
  }
  if (playing) {
    currentPlayPosition += deltaTime / 60 * playbackSpeed;
    // check if we hit the end of the play
    if (currentPlayPosition > endTime) {
      currentPlayPosition = endTime;
      playing = false;
    }
  }
  $("#slider").slider('value', currentPlayPosition);
  $("#playbackSpeed").slider('value', playbackSpeed);

  $("#currentTimeText").text(""
    + (Math.floor((currentPlayPosition + baseMinutes)/60) + baseHours)
    + ":" + ((Math.floor(currentPlayPosition + baseMinutes) % 60) + "").padStart(2, '0')
    + ":" + (((currentPlayPosition) % 1) * 60).toFixed(0).padStart(2, '0'));
  previousTime = currentTime;

  for (let anim of animations) {
    anim();
  }
  ActorPath.groupNearby();
  requestAnimationFrame(animateAll);
}
requestAnimationFrame(animateAll);


let rawFile = new XMLHttpRequest();
rawFile.overrideMimeType("application/json");
rawFile.open("GET", "playdate_101220.json", true);
rawFile.onreadystatechange = function() {
  if (rawFile.readyState === 4 && rawFile.status == "200") {
    // initialize
    journeys = JSON.parse(rawFile.responseText);
    jsonToMap();
  }
}
rawFile.send(null);

// if (localStorage.getItem('actorsJson') != null) {
//     jsonSourceElement.value = localStorage.getItem('actorsJson');
// }