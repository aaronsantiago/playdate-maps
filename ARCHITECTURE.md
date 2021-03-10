
## High Level

PLAYDATE web is a Mapbox map with markers that represent performers. At page load, a JSON file with data about what locations performers visited and when is parsed, and requests are sent to the Mapbox API to generate walking paths for each actor for the entirety of the runtime. These paths are used to update the positions of each marker.

## JSON format

The JSON is a map of actor names to a list of destination entries. These entries describe where and when an actor goes, along with other information.

An example entry from the JSON file
```
{
  "name": "Top Beauty",
  "pass_through": [-73.98749011000541, 40.691585313677024],
  "coordinates": [ -73.98724293447953, 40.691923693517424],
  "time": 16,
  "stayDuration": 5,
  "interior": 1
}
```

 - `name`: unused currently
 - `pass_through`: optional, adds extra waypoints to the Mapbox directions request to correct paths that were not following the actors' actual movements.
 - `coordinates`: latitude and longitude of the destination of this entry
 - `time`: the timestamp that the actor reaches this destination. the unit is in *minutes since the beginning of the performance*
 - `stayDuration`: optional, notates how long the actor stays at this destination before leaving for the next one
 - `interior`: optional, if this is 1 then the marker position will be set to the *actual coordinates* in the destination rather than the destination given by Mapbox as the end of the path. Mapbox tends to make the actors stay on the street in the directions response.

 ## Features overview

 A list of things that are in this app:

  - Playback Controls
    - Play/pause
    - Multiple playback speeds
    - Timeline scrubbing
    - Return to beginning button
  - Actor Pathing
    - Interior/exterior
    - Automatically generated walking paths
    - Movement smoothing per frame
    - Nearby actors "grouped" together
  - Interface
    - Help modal available by clicking the question mark
    - Click on an actor to center the screen on the actor, drag the map to disengage the lock
    - Automatically hiding of the playback bar

