var origin = [
  -73.974663,
  40.685474
];
let pointCounter = 0;
class ActorPath {
  constructor(map, name) {
    this.name = name;
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
    this.totalDuration = 0;
    this.marker = null;
    this.loaded = false;
    let onLoad = () => {

      // create a DOM element for the marker
      var el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage =
        'url("images/' + this.name + '.png")';
      el.style.width = '50px';
      el.style.height = '50px';

      var popup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
      .setHTML(this.name);

      // add marker to map
      this.marker = new mapboxgl.Marker(el)
        .setLngLat(this.point.features[0].geometry.coordinates)
        .setPopup(popup) // sets a popup on this marker
        .addTo(map);

      const markerDiv = this.marker.getElement();
      markerDiv.addEventListener('mouseenter', () => this.marker.togglePopup());
      markerDiv.addEventListener('mouseleave', () => this.marker.togglePopup());

      map.on('click', event => {
        const target = event.originalEvent.target;
        const markerWasClicked = markerDiv.contains(target);

        if (markerWasClicked) {
          this.marker.togglePopup();
          actorFocus = this.name;
        }
      });

      ActorPath.markers.push(this.marker);

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
      'interior': routeGeometry.interior,
      'waypoint': routeGeometry.waypoint,
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
    this.totalDuration = this.routes[this.routes.length - 1].time
        + this.routes[this.routes.length - 1].stayDuration + 1;

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
    let progress = Math.max(0,
        Math.min(
          (currentTime - route.time - route.stayDuration)
           / route.duration, .999));
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

    //Target position smoothing system
    let tgtPos = this.point.features[0].geometry.coordinates;

    if (route.features[0].geometry.interior > 0
       && currentTime < route.time + route.stayDuration) {
      tgtPos = route.features[0].geometry.waypoint;
    }

    let myPos = this.marker.getLngLat();
    let lerpedPos = [
      myPos.lng + (tgtPos[0] - myPos.lng) * .5, 
      myPos.lat + (tgtPos[1] - myPos.lat) * .5
    ];

    this.marker.setLngLat(lerpedPos);
  }

  static groupNearby() {
    let groupMap = new WeakMap();
    let groups = [];

    for (let i = 0; i < ActorPath.markers.length - 1; i++) {
      for (let j = i + 1; j < ActorPath.markers.length; j++) {
        let marker = ActorPath.markers[i];
        let marker2 = ActorPath.markers[j];

        let distThreshold = 10;
        let p1 = map.project(marker.getLngLat());
        let p2 = map.project(marker2.getLngLat());

        let distSquared = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
        if (distSquared < distThreshold * distThreshold) {
          if (groupMap.has(marker) && groupMap.has(marker2)) {
            let group1 = groupMap.get(marker);
            let group2 = groupMap.get(marker2);

            if (!(group1 === group2)) {
              for (let other of group2) {
                groupMap.set(other, group1);
                group1.push(other);
              }
              groups.splice(groups.indexOf(group2), 1);
            }
          }
          else if (groupMap.has(marker)) {
            groupMap.set(marker2, groupMap.get(marker));
            groupMap.get(marker).push(marker2);
          }
          else if (groupMap.has(marker2)) {
            groupMap.set(marker, groupMap.get(marker2));
            groupMap.get(marker2).push(marker);
          }
          else {
            let group = [marker, marker2];
            groupMap.set(marker, group);
            groupMap.set(marker2, group);
            groups.push(group);
          }
        }
      }
    }

    let popupYOffset = 25;
    for (let marker of ActorPath.markers) {
      let el = marker.getElement();
      el.style.width = '50px';
      el.style.height = '50px';
      marker.setOffset([0,0]);
      let popup = marker.getPopup();
      if (popup != null) popup.setOffset([0,-popupYOffset]);
    }
    let offsetPixels = 35;
    for (let group of groups) {
      let count = 0;
      let numColumns = Math.min(3, group.length);
      let numRows = Math.floor(group.length / numColumns);
      for (let marker of group) {
        let el = marker.getElement();
        el.style.width = offsetPixels + 'px';
        el.style.height = offsetPixels + 'px';
        let offset = [
            (count % numColumns) * offsetPixels - offsetPixels * (numColumns/2 - .5),
            Math.floor(count/numColumns) * offsetPixels - offsetPixels * (numRows/2 - .5)
          ];
        marker.setOffset(offset);
        let popup = marker.getPopup();
        offset[1] -= popupYOffset;
        if (popup != null) popup.setOffset(offset);
        count++;
      }
    }
  }
}

ActorPath.markers = [];

