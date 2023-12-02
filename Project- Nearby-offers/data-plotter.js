let xhr;
let storeData;
let points = [];

const load = () => {
  xhr = new XMLHttpRequest();

  if (!xhr) {
    alert('Couldn\'t create xhr object');
    return false;
  }
  xhr.onreadystatechange = renderContent;
  xhr.open('GET', '/data1.json');
  xhr.send();

  /* 
  

  0 request not initialized
  1 server connected
  2 request received by server
  3 server processing
  4 Request finished

  200 successful
  300 Redirected
  400 Error at web server
  500 Application level error

  coords.lat , coords.lng = store coordinates
  locationlat , locationlng = user location
  
  */

  function renderContent() {

    if (xhr.readyState === 4) {

      if (xhr.status === 200) {

        storeData = JSON.parse(xhr.responseText).storesNearMe;

        document.getElementById('radius').addEventListener('input', plotMarker)       /* reads value of radius and category then calls the function plotmarker*/
        document.getElementById('category').addEventListener('input', plotMarker)

        function plotMarker() {
          document.getElementById("instructions").innerHTML = " "; //blanks up the directions window.
          if (points !== null) {          // removes the markers
            for (let point of points) {
              point.remove();

            }

          }
          if (map.getSource('route')) {  // removes the route 
            map.removeLayer('route');
            map.removeSource('route');
          }

          let radius = document.getElementById('radius').value;
          let categoryData = document.getElementById('category').value;

          for (const { name, discount, category, coords } of storeData) {
            let dist = getDistanceForRadiusCalculation(coords.lat, coords.lng, locationLat, locationLng);
            if (dist <= radius) {
              if (categoryData === category) {
                const el = document.createElement('div');
                el.className = 'marker';

                // make a marker for each feature and add to the map 

                let marker = new mapboxgl.Marker(el)
                  .setLngLat([coords.lng, coords.lat])
                  .setPopup(
                    new mapboxgl.Popup({ offset: 25 }) // add popups
                      .setHTML(`<h2>${discount}</h2>
                                <p>${name}</p>
                                <button id="route" onclick = "route(this.nextElementSibling.innerHTML)"​>Route</button>
                                <p style = "display: none">${coords.lat}_${coords.lng} </p>`
                      )
                  )
                  .addTo(map);
                points.push(marker);

              }
            }
          }

        }

      }
      else {
        console.log("Problem Making Ajax Call");
      }

    }
  }
}

function route(coords) {
  let coordinates = coords.split("_");

  let sLat = parseFloat(coordinates[0]);
  let sLng = parseFloat(coordinates[1]);

  let start = [locationLng, locationLat];

  let end = [sLng, sLat];

  //used to make the api request and return the result as new layer
  getRoute(end);

  async function getRoute(end) {
    // make a directions request using cycling profile


    const query = await fetch( // directions api request with versions, start, end coords along with alternative parameter geojson  
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    //intructions are inside routes > legs > steps > maneuver  
    const instructions = document.getElementById('instructions');
    const steps = data.legs[0].steps;

    let tripInstructions = '';
    for (const step of steps) {
      tripInstructions += `<li>${step.maneuver.instruction}</li>`;
    }
    instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
      data.duration / 60
    )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
  }


}