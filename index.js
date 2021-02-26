
// ************ globals *****************************************

// the time we should start at
let baseHours = 14;
let baseMinutes = 13;

let stallTime = 3; // how long after the start we should do nothing
let endTime = 100;

// playback variables
let playing = false;
let actorFocus = "";
let playbackSpeed = 60;
let playbackLength = 1; // use placeholder length until we calculate the true length
let currentPlayPosition = 0;


// variables for hiding the play bar at the bottom
let hideBarWaitSeconds = 2;
let hideBarTimer = 0;
let isMouseInControls = false;

// are we dragging the map?
let leftMouseButtonDown = false;

// ************ HTML setup *****************************************

// Information screen JS
let monolog = new Monolog({
    loader: false,
    content: "test",
    close: true,
    onOpening: function () {
      console.log('OPENING ...');
    },
    onOpened: function () {
      console.log('... OPENED !');
      this.setContent('<h1 style="text-align: center;">Made by <a href="https://aaron.work">Aaron Santiago</a>.</h1>');
    },
    onClosing: function () {
      console.log('CLOSING ...');
    },
    onClosed: function () {
      console.log('... CLOSED !');
    }
  });

// tooltip setup
$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip({
    delay: {
      show: 500,
      hide: 100
    }
  });
});


$("#slider").slider({
  slide: function (event, ui) {
    currentPlayPosition = ui.value;
  }
});

// ************ keyboard/mouse *****************************************
$(document).on("keydown", function (event) {
  if (event.which == 32) { // spacebar
    togglePlayback();
  }
  for (let i = 1; i < 5; i++) {
    if (event.which == 48 + i) { // 1 - 4 keys
      $("#speed" + i).click();
    }
  }
  if (event.which == 82) { // r key
    currentPlayPosition = 0;
  }
  if (event.which == 8) { // backspace key
    resetButton();
  }
});

$("#timeline").hover(function () {
  isMouseInControls = true;
}, function () {
  isMouseInControls = false;
});

function setLeftButtonState(e) {
  leftMouseButtonDown = e.buttons === undefined
     ? e.which === 1
     : e.buttons === 1;
}

document.body.onmousedown = setLeftButtonState;
document.body.onmousemove = setLeftButtonState;
document.body.onmouseup = setLeftButtonState;

// ************ button callbacks *****************************************

function toggleFullscreen() {
  if (document.fullscreenElement != null) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen();
  }
}

function pause() {
  removeSpeedButtonEnabledClass();
  playing = false;
  $('#pauseButton').addClass('enabled');
}
let currentSpeed = "#speed1";
function play() {
  removeSpeedButtonEnabledClass();
  playing = true;
  $(currentSpeed).addClass('enabled');
}

function removeSpeedButtonEnabledClass() {
  $('#pauseButton').removeClass('enabled');
  $('#speed1').removeClass('enabled');
  $('#speed2').removeClass('enabled');
  $('#speed3').removeClass('enabled');
  $('#speed4').removeClass('enabled');
}

function resetButton() {
  currentPlayPosition = 0;
}

function speed1Button() {
  playbackSpeed = 1;
  currentSpeed = "#speed1";
  play();
}

function speed2Button() {
  playbackSpeed = 5;
  currentSpeed = "#speed2";
  play();
}

function speed3Button() {
  playbackSpeed = 60;
  currentSpeed = "#speed3";
  play();
}

function speed4Button() {
  playbackSpeed = 200;
  currentSpeed = "#speed4";
  play();
}

// playback toggle button
function togglePlayback() {
  if (playing) {
    pause();
  } else {
    play();
  }
}

// actor focus clear
function clearFocus() {
  actorFocus = "";
}

// ************ map setup *****************************************
// mapbox setup
mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb25kb3R3b3JrIiwiYSI6ImNrZjB5aGFkMzBxNzEycmxjZ3B3Zzh1MmYifQ.nO9RZS54KUxX_Xm-0Yr9iA';
let mapboxClient = mapboxSdk({
    accessToken: mapboxgl.accessToken
  });
let mapOptions = {
  container: 'map',
  style: 'mapbox://styles/aarondotwork/cklmp35ni41gc17qmmxn2txo1',
  center: [-73.99042372887936, 40.692302258434665],
  zoom: 16
};
let map = null;

let journeys = {}; // stores parsed actor path journeys
let animations = []; // used to hold actor render functions

let currentIteration = -1; // used to reset state when JSON is refreshed
let jsonToMap = function () {
  currentIteration++;
  if (map != null)
    map.remove();
  map = new mapboxgl.Map(mapOptions);
  map.on('drag', function () {
    clearFocus();
  });
  map.on('mousemove', function () {
    hideBarTimer = 0;
  });
  for (let name in journeys) {
    let journey = journeys[name];

    // process individual locations per journey
    for (let leg of journey) {
      if (isNaN(leg.stayDuration))
        leg.stayDuration = 0;
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
          }
        ]
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
      routes.push[{}
      ];
      // generate waypoints array, optionally including a "passthrough" location
      // that influences the path generated
      let waypoints = [
        journey[i - 1]
      ];
      if (journey[i].hasOwnProperty("pass_through")) {
        let all_coords = journey[i]["pass_through"];
        for (let j = 0; j < all_coords.length; j += 2) {
          let coords = [all_coords[j], all_coords[j + 1]];
          waypoints.push({
            coordinates: coords
          });
        }
      }
      waypoints.push(journey[i]);
      console.log(waypoints);
      mapboxClient.directions.getDirections({
        profile: 'walking',
        geometries: 'geojson',
        waypoints: waypoints
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
            if (myIteration != currentIteration)
              return;
            actor.render(currentPlayPosition - stallTime);

            if (actorFocus == name && !leftMouseButtonDown) {
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

// ************ update loop *****************************************

let previousTime = Date.now();
// update all actor animation functions
function animateAll() {

  // ensure deltaTime calculations still happen when playback
  // is not running
  let currentTime = Date.now();
  let deltaTime = (currentTime - previousTime) / 1000;
  if (!isMouseInControls)
    hideBarTimer += deltaTime;
  if (hideBarTimer < hideBarWaitSeconds) {
    $("#timeline").removeClass("hidden").addClass("visible");
  } else {
    $("#timeline").removeClass("visible").addClass("hidden");
  }
  if (playing) {
    currentPlayPosition += deltaTime / 60 * playbackSpeed;
    // check if we hit the end of the play
    if (currentPlayPosition > endTime) {
      currentPlayPosition = endTime;
      playing = false;
    }
    if (currentPlayPosition < 0) {
      currentPlayPosition = 0;
    }
  }
  $("#slider").slider('value', currentPlayPosition);
  $("#playbackSpeed").slider('value', playbackSpeed);

  $("#currentTimeText").text(""
     + (Math.floor((currentPlayPosition + baseMinutes) / 60) + baseHours)
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


// ************ initialize *****************************************

let rawFile = new XMLHttpRequest();
rawFile.overrideMimeType("application/json");
rawFile.open("GET", "playdate_101220.json", true);
rawFile.onreadystatechange = function () {
  if (rawFile.readyState === 4 && rawFile.status == "200") {
    // initialize
    journeys = JSON.parse(rawFile.responseText);
    jsonToMap();
  }
}
rawFile.send(null);
