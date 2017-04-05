var Quake = function(data) {
  this.place = ko.observable(data.place);
  this.location = ko.observable(data.location);
  this.time = ko.observable(data.time);
  this.magnitude = ko.observable(data.magnitude);
  this.alert = ko.observable(data.alert);
  this.alertColor = ko.observable(data.alertColor);
  this.url = ko.observable(data.url);
  this.significance = ko.observable(data.sig);

  this.included = ko.observable(true);
}

var ViewModel = function() {
  var self = this;
  self.googleReady = ko.observable(false);
  self.quakesLoaded = ko.observable(false);
  self.quakeArray = ko.observableArray([]);

  self.searchString = ko.observable("");
  self.startTime = ko.observable("2000-01-01");
  self.endTime = ko.observable("2017-04-01");
  self.minMagnitude = ko.observable("7.5");
  self.maxMagnitude = ko.observable("10");

  self.newForm = ko.observable(false);
  self.searchForm = ko.observable(false);
  self.locationSelected = ko.observable(true);

  self.errorReported = ko.observable(false);
  self.errorText = ko.observable("");
  self.currentLocation = ko.observable({});


  this.makeMarkers = ko.computed(function() {
    if (self.googleReady() && self.quakesLoaded()) {
      var largeInfowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();

      self.quakeArray().forEach(function(item) {
        var iconColor = getColor(item.significance())
        var icon = makeMarkerIcon(iconColor);
        /*var icon = makeMarkerIcon('7BB718');*/
        item.marker = new  google.maps.Marker({
          map: map,
          position: item.location(),
          title: item.place(),
          icon: icon
        });

        item.marker.setAnimation(null);

        item.marker.addListener('click', function() {
          self.populateInfoWindow(this, largeInfowindow);
          if (this.getAnimation() !== null) {
            this.setAnimation(null);
          } else {
            self.quakeArray().forEach(function(e) {
              e.marker.setAnimation(null);
            });
            this.setAnimation(google.maps.Animation.BOUNCE);
          }
          /*this.setIcon(clickedIcon);*/
        });

        bounds.extend(item.marker.position);

      });

      bounds = self.expandBounds(bounds);
      map.fitBounds(bounds);
    }
  }, this);

  this.getNewScreen = function() {
    self.errorReported(false);
    self.searchForm(false);
    self.newForm(true);
    // toggle slider open
    listDrawer.classList.add('open');
    drawerButton.classList.add('open');
  }

  // If Only One Marker is being displayed, expand the bounds of the map
  // so we see more than blue ocean or empty land. Thanks to StackOverflow!
  // http://stackoverflow.com/questions/3334729/google-maps-v3-fitbounds-zoom-too-close-for-single-marker
  this.expandBounds = function(bounds) {
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 1, bounds.getNorthEast().lng() + 1);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 1, bounds.getNorthEast().lng() - 1);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);
    }
    return(bounds);
  }

  this.searchResults = function() {
    var bounds = new google.maps.LatLngBounds();
    self.quakeArray().forEach(function(item) {
      if (item.place().toLowerCase().includes(self.searchString().toLowerCase())) {
        item.included(true);
        item.marker.setMap(map);
        bounds.extend(item.marker.position);
      } else {
        item.included(false);
        item.marker.setMap(null);
      }
    });

    bounds = self.expandBounds(bounds);
    map.fitBounds(bounds);
  };

  this.displayAll = function() {
    self.errorReported(false);
    var bounds = new google.maps.LatLngBounds();
    self.quakeArray().forEach(function(item) {
      item.included(true);
      item.marker.setMap(map);
      bounds.extend(item.marker.position);
    });

    bounds = self.expandBounds(bounds);
    map.fitBounds(bounds);
    self.newForm(false);
    self.searchForm(true);
    // toggle slider open
    listDrawer.classList.add('open');
    drawerButton.classList.add('open');
  };

  // Thanks to StackOverflow for suggesting how to trigger any Maps API event listener using the event.trigger function
  // http://stackoverflow.com/questions/9194579/how-to-simulate-a-click-on-a-google-maps-marker
  this.listItemClicked = function() {
    google.maps.event.trigger(this.marker, 'click', {
      latLng: new google.maps.LatLng(0,0)
    });
  }

  this.loadEarthquakes = function() {
    self.errorReported(false);

    // get rid of markers from old quakeArray
    self.quakeArray().forEach(function(item) {
      item.marker.setMap(null);
    });
    // empty old quakeArray
    self.quakeArray([]);

    if (!self.startTime()) {
      self.startTime("1900-01-01");
      console.log('Start Time assigned value of 1900-01-01');
    }

    var earthquakeURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime='
                        + self.startTime();
    if (self.endTime()) {
      earthquakeURL += '&endtime=' + self.endTime();
    }
    if (self.minMagnitude()) {
      earthquakeURL += '&minmagnitude=' + self.minMagnitude();
    }
    if (self.maxMagnitude()) {
      earthquakeURL += '&maxmagnitude=' + self.maxMagnitude();
    }
    console.log('earthquakeURL = ' + earthquakeURL);

    var waitingMessage = setTimeout(function() {
      self.errorReported(true);
      self.errorText('Waiting for Results...');
    }, 1500);

    $.getJSON( earthquakeURL )
      .done(function(data) {
        clearTimeout(waitingMessage);
        self.errorReported(false);
        // log data to see how it's structured.
        console.log(data);

        if (data.hasOwnProperty('features')) {
          var features = data.features;
          if (features.length >= 2000) {
            self.errorReported(true);
            self.errorText('More than 2000 results returned. Try Narrowing Your Search.');

          } else if (features.length > 0) {
            self.errorReported(false);
            features.forEach(function(e) {
              var quakeObject = {
                place: e.properties.place,
                location: {
                  lat: e.geometry.coordinates[1],
                  lng: e.geometry.coordinates[0]
                },
                time: e.properties.time,
                magnitude: e.properties.mag,
                alert: e.properties.alert,//green
                url: e.properties.url,
                sig: e.properties.sig,
                intensity: e.properties.cdi
              };

              if (!quakeObject.alert) {
                quakeObject.alert = '(none)';
              }

              quakeObject.alertColor = getAlertColor(quakeObject.alert);

              var newQuake = new Quake(quakeObject);
              self.quakeArray.push(newQuake);
            });

            self.newForm(false);
            self.searchForm(true);
            self.makeMarkers();

          } else {
            self.errorReported(true);
            self.errorText("No Quakes Found. Check your Dates and Magnitudes.");
          }

          self.quakesLoaded(true);
        }



/*
        if (data.hasOwnProperty('items')) {
          bookFound = true;
          var items = data.items;
          var firstBook = data.items[0];
          console.log(firstBook);
        }
*/
/*
        if (bookFound) {
          // Check if properties exist and assign their values to global variables
          if (firstBook.volumeInfo.hasOwnProperty('title')) {
            bookTitle = firstBook.volumeInfo.title;
          } else {
            bookTitle = "No Title Found";
          }
          if (firstBook.volumeInfo.hasOwnProperty('authors')) {
            bookAuthor = "";
            var authors = firstBook.volumeInfo.authors;
            var numAuthors = authors.length;
            for (var i = 0; i < (numAuthors - 1); i++) {
              bookAuthor += authors[i];
              bookAuthor += ', ';
            }
            bookAuthor += authors[numAuthors - 1];
          } else {
            bookAuthor = "No Author Listed";
          }
          if (firstBook.volumeInfo.hasOwnProperty('imageLinks')) {
            if (firstBook.volumeInfo.imageLinks.hasOwnProperty('smallThumbnail')) {
              bookImageSrc = firstBook.volumeInfo.imageLinks.smallThumbnail;
            } else if (firstBook.volumeInfo.imageLinks.hasOwnProperty('thumbnail')) {
              bookImageSrc = firstBook.volumeInfo.imageLinks.thumbnail;
            }
          } else {
            bookImageSrc = "img/books.jpg";
          }
        } else {
          bookTitle = 'No Title Found';
          bookAuthor = 'No Author Listed';
          bookImageSrc = 'img/books.jpg';
        }
*/
      })
      .fail(function(data) {
        clearTimeout(waitingMessage);
        self.errorReported(true);
        console.log('Request for Earthquakes Failed');
        if (data.hasOwnProperty('statusText')) {
          if (data.statusText === 'Bad Request') {
            if (data.hasOwnProperty('responseText')) {
              var errorMsg = data.responseText;
              console.log('errorMsg = ' + errorMsg);
              var msgStart = 0;
              var msgEnd = errorMsg.length;
              // extract the main gist of the error message
              var msgStart = errorMsg.indexOf('Bad Request') + 13;
              var msgEnd = errorMsg.indexOf('.', msgStart) + 1;
              // check if -1 returned (i.e. search string not found) for either
              // msgStart or msgEnd (Note: we already added 13 and 1)
              if (msgStart === 12) {
                msgStart = 0;
              }
              if (msgEnd === 0) {
                msgEnd = errorMsg.length;
              }
              var reportedMsg = errorMsg.slice(msgStart, msgEnd);
              console.log('reportedMsg = ' + reportedMsg);
              self.errorText(reportedMsg + ' Try Another Search.');
            }
          } else {
            self.errorText(data.statusText + ' Earthquake Data Unavailable. Check Input Formatting.');
          }
        } else {
          self.errorText('Earthquake Data Unavailable. Check Input Formatting.');
        }
      });

    return false;
  };
};

function getColor(sig) {
  if (sig >= 900) {
    return ('ff0000');
  } else if (mag >= 800) {
    return ('ff4500');
  } else if (mag >= 700) {
    return ('ffa500');
  } else if (mag >= 550) {
    return ('ffCC00');
  } else if (mag >= 400) {
    return ('ffff24');
  } else {
    return ('7bb718');
  }
}

function getAlertColor(alert) {
  switch (alert) {
    case 'green':
      return '#7bb718';
      break;
    case 'yellow':
      return '#ffff24';
      break;
    case 'orange':
      return '#ffa500';
      break;
    case 'red':
      return '#ff0000';
      break;
    default:
      return '#0000ff';
  }
}

var drawerButton = document.getElementById('list-drawer-button');
var listDrawer = document.getElementById('list-drawer');

drawerButton.addEventListener('click', function(e) {
  listDrawer.classList.toggle('open');
  drawerButton.classList.toggle('open');
  e.stopPropagation();
});

var viewModel = new ViewModel();

ko.applyBindings(viewModel);
/*
viewModel.loadEarthquakes();
*/
