var Quake = function(data) {
  this.place = ko.observable(data.place);
  this.location = ko.observable(data.location);
  this.time = ko.observable(data.time);
  this.magnitude = ko.observable(data.magnitude);
  this.url = ko.observable(data.url);
  this.significance = ko.observable(data.sig);

  this.included = ko.observable(true);
  this.articles = ko.observableArray([]);
  this.photos = ko.observableArray([]);
}

var Article = function(data) {
  this.headline = ko.observable(data.headline);
  this.snippet = ko.observable(data.snippet);
  this.artURL = ko.observable(data.artURL);
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

  self.newForm = ko.observable(true);
  self.searchForm = ko.observable(false);
  self.locationForm = ko.observable(false);

  self.errorReported = ko.observable(false);
  self.errorText = ko.observable("");

/*  self.currentLocArticles = ko.observableArray([]);
*/

  this.makeMarkers = ko.computed(function() {
    if (self.googleReady() && self.quakesLoaded()) {
      var largeInfowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();

      self.quakeArray().forEach(function(item) {
        var icon = makeMarkerIcon(item.iconColor());
        /*var icon = makeMarkerIcon('7BB718');*/
        item.marker = new  google.maps.Marker({
          map: map,
          position: item.location(),
          title: item.place(),
          icon: icon
        });

        item.marker.setAnimation(null);

        item.marker.addListener('click', function() {
          self.newForm(false);
          self.searchForm(false);
          self.locationForm(true);
          self.currentLocation(item);

          if (item.photos().length === 0) {
            var photoArray = self.getPhotos(item.location());
            item.photos(photoArray);
          }


          if (item.articles().length === 0) {
            self.loadNYT();
            console.log('NYT loading!!!')
          }
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

  this.backToResults = function() {
    self.newForm(false);
    self.searchForm(true);
    self.locationForm(false);

  }

  this.getNewScreen = function() {
    self.errorReported(false);
    self.newForm(true);
    self.searchForm(false);
    self.locationForm(false);
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
    self.locationForm(false);
    // toggle slider open
    listDrawer.classList.add('open');
    drawerButton.classList.add('open');
  };

  // Thanks to StackOverflow for suggesting how to trigger any Maps API event listener using the event.trigger function
  // http://stackoverflow.com/questions/9194579/how-to-simulate-a-click-on-a-google-maps-marker
  this.listItemClicked = function(clickedItem) {
    /*self.currentLocation(clickedItem);*/
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
    self.quakeArray().length = 0;

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

    earthquakeURL += '&orderby=magnitude';

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
          if (features.length >= 400) {
            self.errorReported(true);
            self.errorText('More than 400 results returned. Try Narrowing Your Search.');
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
                url: e.properties.url,
                sig: e.properties.sig,
                intensity: e.properties.cdi
              };

              var newQuake = new Quake(quakeObject);
              newQuake.prettyTime = ko.computed(function() {
                return makeTimePretty(newQuake.time());
              });
              newQuake.iconColor = ko.computed(function() {
                return getIconColor(newQuake.significance());
              });

              self.quakeArray.push(newQuake);
            });

            self.newForm(false);
            self.searchForm(true);
            self.locationForm(false);
            self.makeMarkers();
            self.currentLocation = ko.observable(self.quakeArray()[0]);

          } else {
            self.errorReported(true);
            self.errorText("No Quakes Found. Check your Dates and Magnitudes.");
          }
          self.quakesLoaded(true);
        }
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
              /*var msgStart = 0;
              var msgEnd = errorMsg.length;*/
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

  this.loadNYT = function() {
    var quakeTime = self.currentLocation().time();
    // 86400000 = milliseconds in 1 day
    var addTime = 86400000 * 14;
    var withAddedTime = quakeTime + addTime;

    var searchStart = new Date(quakeTime);
    var startYear = searchStart.getUTCFullYear();
    var startMonth = searchStart.getUTCMonth();
    var startDate = searchStart.getUTCDate();
    var startString = startYear + getStringMonth(startMonth) + getStringDate(startDate);

    var searchEnd = new Date(withAddedTime);
    var endYear = searchEnd.getUTCFullYear();
    var endMonth = searchEnd.getUTCMonth();
    var endDate = searchEnd.getUTCDate();
    var endString = endYear + getStringMonth(endMonth) + getStringDate(endDate);

    var searchTerm = getSearchTerm(self.currentLocation().place());
    var prettySearchTerm = searchTerm.replace('+', ' ');
    var fullSearchTerm = 'quake+' + searchTerm;

    /*var searchTerm = 'quake+' + getSearchTerms(self.currentLocation().place());
    console.log('fullSearchTerm = ' + fullSearchTerm);*/

    var nytURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    nytURL += '?' + $.param({
      'api-key': "3579d2c108694c7fb536928a79360c54",
      'q': fullSearchTerm,
      /*'fq': "section_name:(\"World\" \"Front Page\" \"International\" \"Week in Review\" \"Opinion\")",*/
      'begin_date': startString,
      'end_date': endString,
      'fl': "headline,snippet,web_url"
    });

    $.getJSON( nytURL )
      .done(function(data) {
        console.log(data);
        var articles = data.response.docs;
        /*self.currentLocArticles([]);
        self.currentLocArticles.length = 0;*/

        if (articles.length > 0) {
          articles.forEach(function(art) {
            var articleObject = {
              headline: art.headline.main,
              snippet: art.snippet,
              artURL: art.web_url
            };
            var newArticle = new Article(articleObject);
            self.currentLocation().articles.push(newArticle);
          });
        } else {
          var sorryHeadline = "No NYT Articles Found for a quake in " + prettySearchTerm;
          var articleObject = {
            headline: sorryHeadline,
            snippet: "Go to the NYT Home Page to search futher.",
            artURL: 'https://www.nytimes.com/'
          };
          var newArticle = new Article(articleObject);
          self.currentLocation().articles.push(newArticle);
        }

      })
      .fail(function(data) {
        console.log('NYT failed to load. Try Again.');

        // Following Code won't work, because an object in the array
        // will prevent a NYT search for this location!
/*
        var sorryHeadline = "New York Times Failed to Load";
        var articleObject = {
          headline: sorryHeadline,
          snippet: "Try Clicking the Location Again.",
          artURL: 'https://www.nytimes.com/'
        };
        var newArticle = new Article(articleObject);
        self.currentLocation().articles.push(newArticle);
*/
      });

    return false;
  };





};

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
