var map;

// Array which will hold the quake location markers.
var markers = [];

// Initialize the map. When it is good-to-go, set the ViewModel's googleReady
// property to true, thereby letting the makeMarkers function know
// that it can do it's stuff
ViewModel.prototype.initMap = function() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.5425, lng: -80.24466},
    zoom: 15,
    mapTypeControl: false
  });

  var bounds = new google.maps.LatLngBounds();

  map.fitBounds(bounds);

  this.googleReady(true);
};

// Attach the infowindow to the current marker and fill it with
// that marker's information
ViewModel.prototype.populateInfoWindow = function(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent(marker.infoTitle);
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function(){
      infowindow.marker = null;
      marker.setAnimation(null);
    });
  }
};

// Take in a COLOR and return a new marker icon of that color.
// The icon will be 21 px wide by 34 high, have an origin of 0, 0
// and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}
