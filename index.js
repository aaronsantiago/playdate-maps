// menu toggle button
let slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70
});
document.querySelector('.toggle-button').addEventListener('click', function() {
  slideout.toggle();
});

// JSON toggle button
function toggleJson() {
  let x = document.getElementById("json");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
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
let sliderResolution = 300000;
$("#slider")
    .slider({
        max: sliderResolution
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
$("#slider").slider({
    slide: function(event, ui) {
      currentPlayPosition = playbackLength * ui.value/sliderResolution;
    }
});

function toggleTimeline() {
  $("#timeline").toggle();
}

// playback variables
let playing = true;
let actorFocus = "";
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
let map = new mapboxgl.Map(mapOptions);


let journeys = {}; // stores parsed actor path journeys
let animations = []; // used to hold actor render functions

let currentIteration = -1; // used to reset state when JSON is refreshed
let jsonToMap = function() {
  currentIteration++;
  map.remove();
  map = new mapboxgl.Map(mapOptions);
  for (let name in journeys) {
    let journey = journeys[name];

    // setup button to focus this actor
    let btn = document.createElement("BUTTON");
    btn.innerHTML = "focus " + name;
    btn.onclick = () => { actorFocus = name };
    document.getElementById("actorFocus").appendChild(btn);

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
          routeGeometry.time = journey[i - 1].time;
          routeGeometry.duration = journey[i].time - journey[i - 1].time - journey[i - 1].stayDuration;
          routeGeometry.stayDuration = journey[i - 1].stayDuration;


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
              actor.render(currentPlayPosition);

              if (actorFocus == name) {
                map.flyTo({
                  center: actor.point.features[0].geometry.coordinates,
                  essential: true // this animation is considered essential with respect to prefers-reduced-motion
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
  if (playing) {
    currentPlayPosition += (currentTime - previousTime) / 1000;
  }
  let clamped = Math.min(1, Math.max(0, currentPlayPosition / playbackLength));
  $("#slider").slider('value', Math.floor(clamped * sliderResolution));
  $("#currentTimeText").text("" + Math.floor(clamped * playbackLength) + ":" + (((clamped * playbackLength) % 1) * 60).toFixed(2).padStart(5, '0'));
  previousTime = currentTime;

  for (let anim of animations) {
    anim();
  }
  requestAnimationFrame(animateAll);
}
requestAnimationFrame(animateAll);

// set up "live updating" json, initialize with json from DOM
const jsonSourceElement = document.querySelector('#json');
jsonSourceElement.addEventListener('change', (event) => {
  journeys = JSON.parse(event.target.value);
  jsonToMap();
  // localStorage.setItem('actorsJson', event.target.value);
});

let rawFile = new XMLHttpRequest();
rawFile.overrideMimeType("application/json");
rawFile.open("GET", "playdate_101220.json", true);
rawFile.onreadystatechange = function() {
  if (rawFile.readyState === 4 && rawFile.status == "200") {
    jsonSourceElement.value = rawFile.responseText;

    // initialize
    journeys = JSON.parse(jsonSourceElement.value);
    jsonToMap();
  }
}
rawFile.send(null);

// if (localStorage.getItem('actorsJson') != null) {
//     jsonSourceElement.value = localStorage.getItem('actorsJson');
// }