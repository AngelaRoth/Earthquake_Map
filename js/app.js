var Quake = function(data) {
  this.place = ko.observable(data.place);
  this.location = ko.observable(data.location);
  this.time = ko.observable(data.time);
  this.magnitude = ko.observable(data.magnitude);
  this.alert = ko.observable(data.alert);
  this.tsunami = ko.observable(data.tsunami);

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

  self.searchForm = ko.observable(false);
  self.newForm = ko.observable(true);

  this.makeMarkers = ko.computed(function() {
    if (self.googleReady() && self.quakesLoaded()) {
      var largeInfowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();

      self.quakeArray().forEach(function(item) {
        var iconColor = getColor(item.magnitude())
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
    self.searchForm(false);
    self.newForm(true);
    // toggle slider open
    listDrawer.classList.add('open');
    drawerButton.classList.add('open');
    e.stopPropagation();
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
    var bounds = new google.maps.LatLngBounds();
    self.quakeArray().forEach(function(item) {
      item.included(true);
      item.marker.setMap(map);
      bounds.extend(item.marker.position);
    });

    bounds = self.expandBounds(bounds);
    map.fitBounds(bounds);
  };

  // Thanks to StackOverflow for suggesting how to trigger any Maps API event listener using the event.trigger function
  // http://stackoverflow.com/questions/9194579/how-to-simulate-a-click-on-a-google-maps-marker
  this.listItemClicked = function() {
    google.maps.event.trigger(this.marker, 'click', {
      latLng: new google.maps.LatLng(0,0)
    });
  }

  this.loadEarthquakes = function() {
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

    $.getJSON( earthquakeURL )
      .done(function(data) {
        // log data to see how it's structured.
        console.log(data);

        if (data.hasOwnProperty('features')) {
          var features = data.features;
          if (features.length > 0) {
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
                tsunami: e.properties.tsunami
              };

              var newQuake = new Quake(quakeObject);
              self.quakeArray.push(newQuake);
            });

            self.quakesLoaded(true);

          } else {
            console.log('no quakes found');
          }
        }

        self.newForm(false);
        self.searchForm(true);
        self.makeMarkers();


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
      .fail(function() {
        console.log('Earthquake data Unavailable');
      });

    return false;
  };
};

function getColor(mag) {
  if (mag >= 8.0) {
    return ('ff0000');
  } else if (mag >= 7.7) {
    return ('ffa500');
  } else if (mag >= 7.2) {
    return ('ffff24');
  } else {
    return ('7bb718');
  }
}

var drawerButton = document.getElementById('container-button');
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
