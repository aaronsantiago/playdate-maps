let reparsed = [];
Papa.parse("locations.csv", {
  download: true,
  complete: function(results) {
    for (let row of results.data) {
      if (row.length < 2) continue;
      let label = row[0];
      let reparsedRow = [label];
      console.log(row[1]);
      let json = JSON.parse(row[1]);
      console.log(json);
      for (let feature of json.features) {
        reparsedRow.push(feature.place_name);
      }
      reparsed.push(reparsedRow);
    }
    console.log(Papa.unparse(reparsed));
  }
});

let places = new Set();
Papa.parse("min-by-min.tsv", {
  download: true,
  complete: function(results) {
    console.log(results);
    for (let i = 1; i < results.data.length; i++) {
      let row = results.data[i];
      for (let j = 2; j < row.length && j < 3; j++) {
        places.add(row[j]);
        //console.log(row[j]);
      }
    }
    console.log("places");
    console.log(places);

    let responsesFound = 0;
    let responses = [];
    console.log("geocoding");
    for (let item of places) {
      console.log(item);
      mapboxClient.geocoding.forwardGeocode({
          query: item,
          limit: 2
        })
        .send()
        .then(response => {
          responsesFound += 1;
          responses.push([item, response.rawBody]);
          console.log(Papa.unparse(responses));
        });
    }
  }
});




// San Francisco
var origin = [
  -73.974663,
  40.685474
];

// Washington DC
var destination = [
  -73.972694,
  40.685921
];
[{
    "distance": 27.549,
    "name": "Hanson Place",
    "location": []
  },
  {
    "distance": 3.875,
    "name": "Greene Avenue",
    "location": []
  }
],



let totalPoints = 0;

function init(routeGeometry) {
  let pointCounter = totalPoints;
  // A simple line from origin to destination.
  var route = {
    'type': 'FeatureCollection',
    'features': [{
      'type': 'Feature',
      "geometry": routeGeometry,
    }]
  };

  // A single point that animates along the route.
  // Coordinates are initially set to origin.
  var point = {
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

  // Calculate the distance in kilometers between route start/end point.
  var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

  var arc = [];

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  var steps = 500;

  // Draw an arc between the `origin` & `destination` of the two points
  for (var i = 0; i < lineDistance; i += lineDistance / steps) {
    var segment = turf.along(route.features[0], i, 'kilometers');
    arc.push(segment.geometry.coordinates);
  }

  // Update the route with calculated arc coordinates
  route.features[0].geometry.coordinates = arc;

  // Used to increment the value of the point measurement against the route.
  var counter = 0;

  map.on('load', function() {
    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('route' + pointCounter, {
      'type': 'geojson',
      'data': route
    });

    map.addSource('point' + pointCounter, {
      'type': 'geojson',
      'data': point
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

    map.addLayer({
      'id': 'point' + pointCounter,
      'source': 'point' + pointCounter,
      'type': 'symbol',
      'layout': {
        'icon-image': 'airport-15',
        'icon-rotate': ['get', 'bearing'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });

    function animate() {
      // Update point geometry to a new position based on counter denoting
      // the index to access the arc.
      point.features[0].geometry.coordinates =
        route.features[0].geometry.coordinates[counter];

      // Calculate the bearing to ensure the icon is rotated to match the route arc
      // The bearing is calculate between the current point and the next point, except
      // at the end of the arc use the previous point and the current point
      point.features[0].properties.bearing = turf.bearing(
        turf.point(
          route.features[0].geometry.coordinates[
            counter >= steps ? counter - 1 : counter
          ]
        ),
        turf.point(
          route.features[0].geometry.coordinates[
            counter >= steps ? counter : counter + 1
          ]
        )
      );

      // Update the source with this new data.
      map.getSource('point' + pointCounter).setData(point);

      // Request the next frame of animation so long the end has not been reached.
      if (counter < steps) {
        requestAnimationFrame(animate);
      }

      counter = counter + 1;
    }

    document
      .getElementById('replay')
      .addEventListener('click', function() {
        // Set the coordinates of the original point back to origin
        point.features[0].geometry.coordinates = origin;

        // Update the source layer
        map.getSource('point' + pointCounter).setData(point);

        // Reset the counter
        counter = 0;

        // Restart the animation.
        animate(counter);
      });

    // Start the animation.
    animate(counter);
  });
  totalPoints = totalPoints + 1;
}

// pk.eyJ1IjoiYWFyb25kb3R3b3JrIiwiYSI6ImNrZjB5aGFkMzBxNzEycmxjZ3B3Zzh1MmYifQ.nO9RZS54KUxX_Xm - 0 Yr9iA

// https: //api.mapbox.com/matching/v5/mapbox/walking/-73.93132,40.682431;-73.972688,40.685886.json?access_token=pk.eyJ1IjoiYWFyb25kb3R3b3JrIiwiYSI6ImNrZjB5aGFkMzBxNzEycmxjZ3B3Zzh1MmYifQ.nO9RZS54KUxX_Xm-0Yr9iA

// https: //api.mapbox.com/directions/v5/mapbox/walking/-73.974609,40.68523;-73.972688,40.685886.json?access_token=pk.eyJ1IjoiYWFyb25kb3R3b3JrIiwiYSI6ImNrZjB5aGFkMzBxNzEycmxjZ3B3Zzh1MmYifQ.nO9RZS54KUxX_Xm-0Yr9iA&overview=full&geometries=geojson




map.addSource(id, {
  'type': 'geojson',
  'data': point
});
sources.push(id);
map.addLayer({
  'id': id,
  'source': id,
  'type': 'symbol',
  'layout': {
    'icon-image': 'marker-15',
    'icon-rotate': ['get', 'bearing'],
    'icon-rotation-alignment': 'map',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true
  }
});
layers.push(id);