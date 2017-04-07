var map;

// Create a new blank array for all the listing markers.
var markers = [];

/*var clickedIcon;*/

ViewModel.prototype.initMap = function() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.5425, lng: -80.24466},
    zoom: 15,
    mapTypeControl: false
  });

  var bounds = new google.maps.LatLngBounds();

  map.fitBounds(bounds);

  this.googleReady(true);
};

ViewModel.prototype.populateInfoWindow = function(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent(marker.title);
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function(){
      infowindow.setMarker = null;
      marker.setAnimation(null);
    });
  }
};

ViewModel.prototype.getPlaceId = function(location) {
  var geocoder = new google.maps.Geocoder;
  var placeId = '';

  latitude=location.lat;
  longitude=location.lng;
  var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};

  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      console.log(results);
      if (results[0]) {
        placeId = results[0].place_id;
        console.log('Place Id = ' + placeId);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });

  /*console.log('Place Id = ' + placeId);*/
  return placeId;
};



// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
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
