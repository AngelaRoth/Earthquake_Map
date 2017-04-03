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

        item.marker.addListener('click', function() {
          self.populateInfoWindow(this, largeInfowindow);
          this.setIcon(clickedIcon);
        });

        bounds.extend(item.marker.position);

      });

      map.fitBounds(bounds);
    }
  }, this);

  this.searchResults = function() {
    console.log('in searchResults');
    self.quakeArray().forEach(function(item) {
      if (item.place().toLowerCase().includes(self.searchString().toLowerCase())) {
        item.included(true);
      } else {
        item.included (false);
      }
      console.log(item.place() + " = " + item.included());
    });
  };

  this.displayAll = function() {
    self.quakeArray().forEach(function(item) {
      item.included(true);
      console.log(item.place() + " = " + item.included());
    });
  };






  // Thanks to StackOverflow for suggesting how to trigger any Maps API event listener using the event.trigger function
  // http://stackoverflow.com/questions/9194579/how-to-simulate-a-click-on-a-google-maps-marker
  this.listItemClicked = function() {
    google.maps.event.trigger(this.marker, 'click', {
      latLng: new google.maps.LatLng(0,0)
    });
  }
/*
  this.filter = function(type) {
    var bounds = new google.maps.LatLngBounds();
    self.filteredList().length = 0;
    self.locationList().forEach(function(item) {
      if (item.type() === type || type === 'all') {
        self.filteredList.push(item);
        item.marker.setMap(map);
        bounds.extend(item.marker.position);
      } else {
        item.marker.setMap(null);
      }
    });
    self.allBounds = bounds;
    map.fitBounds(bounds);
  };
*/
  this.loadEarthquakes = function() {
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
/*
ViewModel.prototype.findQuakes = function(startDate, endDate, minMagnitude, maxMagnitude) {

}
*/


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

viewModel.loadEarthquakes();
