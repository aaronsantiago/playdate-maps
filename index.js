
// menu toggle button
var slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70
});
document.querySelector('.toggle-button').addEventListener('click', function() {
  slideout.toggle();
});


// mapbox setup

mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb25kb3R3b3JrIiwiYSI6ImNrZjB5aGFkMzBxNzEycmxjZ3B3Zzh1MmYifQ.nO9RZS54KUxX_Xm-0Yr9iA';
var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });

let mapOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-73.99042372887936, 40.692302258434665],
  zoom: 26
};

var map = new mapboxgl.Map(mapOptions);

let journeys = {};
let animations = [];

let currentIteration = -1;
let jsonToMap = function() {
  currentIteration++;
  map.remove();
  map = new mapboxgl.Map(mapOptions);
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
            let actor = new ActorPath(map);
            for (let route of routes) {
              actor.addGeometry(route);
            }
            actor.finalize();

            function animate() {
              // make sure to bail if app has been reloaded
              if (myIteration != currentIteration) return;
              actor.render(Date.now() / 1000 % 47);
            }
            animations.push(animate);
          }
        });
    }
  }
}

// update all actor animation functions
function animateAll() {
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

// if (localStorage.getItem('actorsJson') != null) {
//     jsonSourceElement.value = localStorage.getItem('actorsJson');
// }

// initialize
journeys = JSON.parse(jsonSourceElement.value);
jsonToMap();