mapboxgl.accessToken = 'pk.eyJ1IjoiYXNodXRvc2gtbXVraGVyamVlIiwiYSI6ImNrdGNtbHN5MTI3N2MycG45emNsdG5xcWoifQ.tvV6cRwhIOyGIyy8QKPxtg';

let locationLat, locationLng;

//geolocation API

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    function (position) {

      locationLng = position.coords.longitude;
      locationLat = position.coords.latitude;

    },
    function (error) {
      console.log("Error or user didn't share location");
      console.error();
    }
  );
} else {
  console.log("GeoLocation is not available");
}
//including map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [81.6582886, 21.2329772],
  zoom: 13,
})
//map controls
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
  showUserHeading: true,
}),
)
map.addControl(new mapboxgl.NavigationControl(), 'top-right')


// distance calculation for radius
function getDistanceForRadiusCalculation(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI / 100)
}

