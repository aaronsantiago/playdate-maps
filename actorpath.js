var origin = [
  -73.974663,
  40.685474
];
let pointCounter = 0;
class ActorPath {
  constructor(map) {
    this.map = map;
    this.routes = [];
    this.id = "actorId" + pointCounter++;
    this.point = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      }]
    };
    this.marker = null;
    this.loaded = false;
    let onLoad = () => {

      // create a DOM element for the marker
      var el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage =
        'url(https://placekitten.com/g/50/50/)';
      el.style.width = '50px';
      el.style.height = '50px';

      // add marker to map
      this.marker = new mapboxgl.Marker(el)
        .setLngLat(this.point.features[0].geometry.coordinates)
        .addTo(map);


      // this.map.addSource(this.id, {
      //     'type': 'geojson',
      //     'data': this.point
      // });

      // this.map.addLayer({
      //     'id': this.id,
      //     'source': this.id,
      //     'type': 'symbol',
      //     'layout': {
      //         'icon-image': 'airport-15',
      //         'icon-rotate': ['get', 'bearing'],
      //         'icon-rotation-alignment': 'map',
      //         'icon-allow-overlap': true,
      //         'icon-ignore-placement': true
      //     }
      // });
      this.loaded = true;
    };
    if (!map.loaded()) {
      this.map.on('load', onLoad);
    } else {
      onLoad();
    }
  }

  addGeometry(routeGeometry) {
    let route = {
      'time': routeGeometry.time,
      'duration': routeGeometry.duration,
      'stayDuration': routeGeometry.stayDuration,
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        "geometry": routeGeometry,
      }]
    };
    this.routes.push(route)

    // Calculate the distance in kilometers between route start/end point.
    route.lineDistance = turf.lineDistance(route.features[0], 'kilometers');

  }

  finalize() {
    for (let i = 0; i < this.routes.length - 1; i++) {
      // this.routes[i].duration = this.routes[i + 1].time - this.routes[i].time;
    }

    let pointCounter = Math.random();
    let onLoad = function() {
      if (name == "Naomi") {
        var route = {
          'type': 'FeatureCollection',
          'features': [{
            'type': 'Feature',
            "geometry": routeGeometry,
          }]
        };
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource('route' + pointCounter, {
          'type': 'geojson',
          'data': route
        });


        map.addLayer({
          'id': 'route' + pointCounter,
          'source': 'route' + pointCounter,
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#007cbf'
          }
        });
      }
    }
    if (!map.loaded()) {
      map.on('load', onLoad);
    } else {
      onLoad();
    }
  }

  render(currentTime) {
    if (!this.loaded) return;
    let route = this.routes[0];
    for (let i = 0; i < this.routes.length; i++) {
      let nextRoute = this.routes[i];
      if (nextRoute.time < currentTime) {
        route = nextRoute;
      } else {
        break;
      }
    }
    let progress = Math.max(0, Math.min((currentTime - route.time - route.stayDuration) / route.duration, .999));
    this.point.features[0].geometry.coordinates = turf.along(route.features[0], route.lineDistance * progress, 'kilometers').geometry.coordinates;
    // this.point.features[0].properties.bearing = turf.bearing(
    //   turf.point(
    //     turf.along(route.features[0], route.lineDistance * progress, 'kilometers').geometry.coordinates
    //   ),
    //   turf.point(
    //     turf.along(route.features[0], route.lineDistance * progress + .01, 'kilometers').geometry.coordinates
    //   )
    // );

    // Update the source with this new data.
    // this.map.getSource(this.id).setData(this.point);

    // add marker to map
    this.marker.setLngLat(this.point.features[0].geometry.coordinates);

    if (name == "Naomi") {
      map.flyTo({
        center: actor.point.features[0].geometry.coordinates
      });
    }
  }
}