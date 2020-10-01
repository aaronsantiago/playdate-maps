
let pointCounter = 0;
class ActorPath {
  constructor(map) {
    this.map = map;
    this.routes = [];
    this.id = pointCounter++;
    this.point = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'Point',
                    'coordinates': origin
                }
            }
        ]
    };
    this.loaded = false;
    this.map.on('load', () => {

        this.map.addSource('point' + this.id, {
            'type': 'geojson',
            'data': this.point
        });

        this.map.addLayer({
            'id': 'point' + this.id,
            'source': 'point' + this.id,
            'type': 'symbol',
            'layout': {
                'icon-image': 'airport-15',
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            }
        });
        this.loaded = true;
    });
  }

  addGeometry(routeGeometry) {
    let route = {
        'time': routeGeometry.time,
        'duration': routeGeometry.duration,
        'stayDuration': routeGeometry.stayDuration,
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                "geometry": routeGeometry,
            }
        ]
    };
    this.routes.push(route)

    // Calculate the distance in kilometers between route start/end point.
    route.lineDistance = turf.lineDistance(route.features[0], 'kilometers');

  }

  finalize() {
    for (let i = 0; i < this.routes.length - 1; i ++) {
        this.routes[i].duration = this.routes[i + 1].time - this.routes[i].time;
    }
  }

  render(currentTime) {
    if (!this.loaded) return;
    let route = this.routes[0];
    let routeDuration = 0;
    for (let i = 0; i < this.routes.length; i++) {
        let nextRoute = this.routes[i];
        if (nextRoute.time < currentTime) {
            route = nextRoute;
        }
        else {
            break;
        }
    }
    let progress = Math.max(0, Math.min((currentTime - route.time - route.stayDuration)/route.duration, 1));
    this.point.features[0].geometry.coordinates = turf.along(route.features[0], route.lineDistance * progress, 'kilometers').geometry.coordinates;
    this.point.features[0].properties.bearing = turf.bearing(
        turf.point(
            turf.along(route.features[0], route.lineDistance * progress, 'kilometers').geometry.coordinates
        ),
        turf.point(
            turf.along(route.features[0], route.lineDistance * progress + .01, 'kilometers').geometry.coordinates
        )
    );

    // Update the source with this new data.
    this.map.getSource('point' + this.id).setData(this.point);

  }
}