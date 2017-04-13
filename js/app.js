// A Quake Object is created from data returned by
// the US Geological Survey API (in the loadEarthquakes function).
var Quake = function(data) {
  this.place = data.place;
  this.location = data.location;
  this.time = data.time;
  this.magnitude = data.magnitude;
  this.url = data.url;
  this.significance = data.sig;

  this.included = ko.observable(true);
  this.prettySearchTerm = ko.observable('');
  this.articles = ko.observableArray([]);
  this.photos = ko.observableArray([]);
  this.articlesFound = ko.observable(false);
  this.photosFound = ko.observable(false);
};

// An Article Object is created from data returned by the New York Times API
// (In the loadNYT function)
var Article = function(data) {
  this.headline = data.headline;
  this.snippet = data.snippet;
  this.artURL = data.artURL;
};

// A Photo Object is created from data returned by the Google Places Library
// (In the getPhotos function)
var Photo = function(data) {
  this.photoURL = data.url;
  this.attribution = data.attribution;

  // Open a new window to display larger version of photo
  this.openPhotoWindow = function() {
    var screenHeight = screen.height;
    var screenWidth = screen.width;
    var heightString = '';
    var widthString = '';

    // For desktops, window is 650 x 500; for mobile, size depends on screen.
    if (screenHeight > 500 && screenWidth > 650) {
      heightString = '500px';
      widthString = '650px';
    } else if (screenHeight > screenWidth) {
      widthString = screenWidth + 'px';
      heightString = (0.77 * screenWidth) + 'px';
    } else {
      heightString = screenHeight + 'px';
      widthString = (1.3 * screenHeight) + 'px';
    }

    var specString = 'toolbar=no,location=no,status=no,menubar=no,resizable=yes,width=' + widthString + ',height=' + heightString;
    window.open(this.photoURL,'photowindow',specString);
    return false;
  };
};

var ViewModel = function() {
  var self = this;
  var quakeInfowindow;
  var notLoadingMessage;
  self.googleReady = ko.observable(false);
  self.quakesLoaded = ko.observable(false);
  self.quakeArray = ko.observableArray([]);

  self.searchString = ko.observable('');
  self.startTime = ko.observable('2014-01-01');
  self.endTime = ko.observable('');
  self.minMagnitude = ko.observable('7.5');
  self.maxMagnitude = ko.observable('');

  // These five properties keep track of which "content box"
  // is displayed in the inner-box of the list-drawer.
  // On Load, newForm is displayed (in case an error occurs with the
  // earthquake search); newForm is the "box" where quake error
  // messages appear.
  self.mapFailed = ko.observable(false);
  self.notLoading = ko.observable(false);
  self.newForm = ko.observable(true);
  self.searchForm = ko.observable(false);
  self.locationForm = ko.observable(false);

  // These two properties are used to display a gold-backed warning message
  // when earthquake search fails or returns too many/zero results
  self.errorReported = ko.observable(false);
  self.errorText = ko.observable('');

  // These two properties are used to open and close the list-drawer
  // They have to be observable because various functions change their state
  self.drawerButtonSrc = ko.observable('img/close.svg');
  self.drawerOpen = ko.observable(true);

  // The following pretty strings are used in box which shows
  // current search terms (#currently-showing)
  self.prettyEnd = ko.computed(function() {
    if (self.endTime()) {
      return self.endTime();
    } else {
      return 'present';
    }
  });

  self.prettyMinMag = ko.computed(function() {
    if (self.minMagnitude()) {
      if (self.maxMagnitude()) {
        return 'between ' + self.minMagnitude();
      } else {
        return 'of ' + self.minMagnitude();
      }
    } else {
      return '0';
    }
  });

  self.prettyMaxMag = ko.computed(function() {
    if (self.maxMagnitude()) {
      return 'and ' + self.maxMagnitude();
    } else {
      return 'and up';
    }
  });

  // WHEN the Google Map is ready AND a new set of Quakes is ready to be
  // loaded, this computed function makes and displays map markers for
  // each quake returned by a new quake search.
  this.makeMarkers = ko.computed(function() {
    // Clear timeout if an observable property changes, causing
    // this function to be "re-called"
    clearTimeout(notLoadingMessage);
    // If map is not ready within 2 seconds of function being called
    // inform user that something might be wrong.
    // (The message for slow earthquake loads is handled in loadEarthquakes)
    if (!self.googleReady()) {
      notLoadingMessage = setTimeout(function() {
        self.newForm(false);
        self.searchForm(false);
        self.locationForm(false);
        self.notLoading(true);
      }, 2000);
    }

    // If google map is ready and quakes are loaded, ok to make markers!
    if (self.googleReady() && self.quakesLoaded()) {
      // Display search results content box
      self.notLoading(false);
      self.newForm(false);
      self.searchForm(true);
      self.locationForm(false);

      // Clear any "error" text which resulted from premature clicking
      // of "All Results" button or slow map/quake loading
      self.errorReported(false);
      self.errorText('');

      quakeInfowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();

      self.quakeArray().forEach(function(item) {
        var icon = makeMarkerIcon(item.iconColor);
        // include magnitude in "hover window"
        var formattedTitle = item.place + '\nMagnitude: ' + item.magnitude;
        var infoWindowTitle = '<div>' + item.place + '</div>' +
                               '<div>Magnitude: <b>' + item.magnitude + '</b></div>';

        item.marker = new google.maps.Marker({
          map: map,
          position: item.location,
          title: formattedTitle,
          infoTitle: infoWindowTitle,
          icon: icon
        });

        item.marker.setAnimation(null);

        item.marker.addListener('click', function() {
          self.newForm(false);
          self.searchForm(false);
          self.locationForm(true);
          self.currentLocation(item);

          // Open drawer to display click results
          self.drawerButtonSrc('img/close.svg');
          self.drawerOpen(true);

          // We don't search for articles (or photos) until a marker is
          // acutally clicked. When a marker is clicked, the articles
          // (or photos) are stored an array. If such an array exists
          // for the quake in question, then no additional call for
          // articles (or photos) is needed.
          if (item.articles().length === 0) {
            self.loadNYT();
          }
          if (item.photos().length === 0) {
            self.getPhotos(item.location);
          }

          self.populateInfoWindow(this, quakeInfowindow);
          if (this.getAnimation() !== null) {
            this.setAnimation(null);
          } else {
            self.quakeArray().forEach(function(e) {
              e.marker.setAnimation(null);
            });
            this.setAnimation(google.maps.Animation.BOUNCE);
          }
        });

        bounds.extend(item.marker.position);
      });

      bounds = self.expandBounds(bounds);
      map.fitBounds(bounds);
    }
  });

  // When the drawer-button is clicked, change the button image
  // and toggle the list-drawer between open an shut.
  this.drawerButtonClicked = function() {
    if (self.drawerButtonSrc() === 'img/close.svg') {
      self.drawerOpen(false);
      self.drawerButtonSrc('img/open.svg');
    } else {
      self.drawerButtonSrc('img/close.svg');
      self.drawerOpen(true);
    }
  };

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
  };

  // Display the initial search screen, ready to perform a new search
  // of the USGS Quake database
  this.getNewScreen = function() {
    self.errorReported(false);
    self.newForm(true);
    self.searchForm(false);
    self.locationForm(false);

    // toggle slider open
    self.drawerOpen(true);
    self.drawerButtonSrc('img/close.svg');

    // if infowindow still open or marker still bouncing, kill them.
    quakeInfowindow.close();
    self.currentLocation().marker.setAnimation(null);

    // Clear search string
    self.searchString('');
  };

  // Display full list of results returned by latest search of the
  // USGS database (i.e. with no filters applied)
  this.displayAll = function() {
    // Because the button which calls this function is visible unless
    // Google Maps fails to load, there is a chance that it might
    // be clicked after Google Maps has begun to load, but before
    // it has finished loading. Because the function calls upon the map,
    // I make sure the map is ready before allowing it to run.
    // I also make sure the quakes are actually loaded.
    if((typeof google !== 'undefined') && self.googleReady() && self.quakesLoaded()) {
      // Button click now results in action, so clear any error message.
      self.errorReported(false);
      self.errorText('');

      // if infowindow still open or marker still bouncing, kill them.
      quakeInfowindow.close();
      self.currentLocation().marker.setAnimation(null);

      // No term being searched on
      self.searchString('');

      var bounds = new google.maps.LatLngBounds();
      self.quakeArray().forEach(function(item) {
        item.included(true);
        item.marker.setVisible(true);
        bounds.extend(item.marker.position);
      });

      bounds = self.expandBounds(bounds);
      map.fitBounds(bounds);
      self.newForm(false);
      self.searchForm(true);
      self.locationForm(false);
      // toggle slider open
      self.drawerOpen(true);
      self.drawerButtonSrc('img/close.svg');
    } else {
      // Let user know why button click has not produced any action
      self.errorReported(true);
      self.errorText('Waiting for Map and Quakes to Load.');
    }
  };

  // Go from displaying details of a particular quake, to displaying the
  // most recent list of search results
  this.backToResults = function() {
    self.newForm(false);
    self.searchForm(true);
    self.locationForm(false);
    // if infowindow still open or marker still bouncing, kill them.
    quakeInfowindow.close();
    self.currentLocation().marker.setAnimation(null);
  };

  // Display a subset of the results returned by the USGS database, based
  // on a user-entered search term
  this.searchResults = function() {
    // if infowindow still open or marker still bouncing, kill them.
    quakeInfowindow.close();
    self.currentLocation().marker.setAnimation(null);
    var bounds = new google.maps.LatLngBounds();
    self.quakeArray().forEach(function(item) {
      if (item.place.toLowerCase().includes(self.searchString().toLowerCase())) {
        item.included(true);
        item.marker.setVisible(true);
        bounds.extend(item.marker.position);
      } else {
        item.included(false);
        item.marker.setVisible(false);
      }
    });

    bounds = self.expandBounds(bounds);
    map.fitBounds(bounds);
  };

  // When an item in the list of search results is clicked, trigger the
  // event listener for its corresponding map marker.
  // Thanks to StackOverflow for suggesting how to trigger any Maps API event
  // listener using the event.trigger function.
  // http://stackoverflow.com/questions/9194579/how-to-simulate-a-click-on-a-google-maps-marker
  this.listItemClicked = function(clickedItem) {
    google.maps.event.trigger(this.marker, 'click', {
      latLng: new google.maps.LatLng(0,0)
    });
  };

  // The powerhouse of this site. This function searches the USGS database
  // for quakes within the user's inputted parameters, makes a new Quake
  // Object from each returned set of quake results, and pushes these new
  // Quake Objects into an array.
  this.loadEarthquakes = function() {
    // When a new search is performed:
    // 1. Tell self that no quakes are ready to have markers made, so that
    //    ko.computed makeMarkers function doesn't go ahead and make
    //    markers before we're ready, and inadvertantly re-make markers
    //    for old quakes!
    self.quakesLoaded(false);

    // 2. The gold-backed error message box disappears
    self.errorReported(false);

    // 3. Markers from previous search are jettisoned
    if ((typeof google !== 'undefined') && self.googleReady()) {
      self.quakeArray().forEach(function(item) {
        item.marker.setMap(null);
      });
    }

    // 4. Quake array is emptied of quakes from previous search
    self.quakeArray([]);
    self.quakeArray().length = 0;

    // If no start time is entered, assign first day of 20th century
    // (start time is the only essential parameter for USGS API)
    if (!self.startTime()) {
      self.startTime("1900-01-01");
      console.log('No Start Date Entered. Start Date assigned value of 1900-01-01');
    }

    // Assemble the URL for the USGS API request
    var earthquakeURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + self.startTime();
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

    // If results take more than 1.5 seconds to load, show a
    // "waiting" message in the "error message" box
    var waitingMessage = setTimeout(function() {
      self.errorReported(true);
      self.errorText('Waiting for Results...');
    }, 1500);

    $.getJSON( earthquakeURL )
      .done(function(data) {
        // When API returns data, cancel the call to the "waiting" message
        clearTimeout(waitingMessage);
        self.errorReported(false);

        // Make sure features property exists before referencing it
        if (data.hasOwnProperty('features')) {
          var features = data.features;
          // Prevent Google Maps from having to display an unwieldy
          // number of markers;
          if (features.length >= 400) {
            self.errorReported(true);
            self.errorText('More than 400 results returned. Try Narrowing Your Search.');

          // if at least one quake is found, make new Quake Objects for
          // each found quake and add them to quakeArray
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
              newQuake.prettyTime = makeTimePretty(newQuake.time);
              newQuake.iconColor = getIconColor(newQuake.significance);
              self.quakeArray.push(newQuake);
            });

            // Tell self that quakes are loaded (before trying to make markers!)
            self.quakesLoaded(true);

            // Make map marker for each result of search
            self.makeMarkers();
            self.currentLocation = ko.observable(self.quakeArray()[0]);

          // If no quakes exist within search parameters, display a
          // message to that effect
          } else {
            self.errorReported(true);
            self.errorText('No Quakes Found. Check your Dates and Magnitudes.');
          }
        }
      })

      // If request to USGS API fails, display the reason for the failure
      // in the gold-backed "error message" box.
      // The two most likely reasons for failure are misformatted input
      // parameters, and too many returned results.
      .fail(function(data) {
        clearTimeout(waitingMessage);
        self.errorReported(true);
        if (data.hasOwnProperty('statusText')) {
          if (data.statusText === 'Bad Request') {
            if (data.hasOwnProperty('responseText')) {
              var errorMsg = data.responseText;

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
              self.errorText(reportedMsg + ' Try Another Search.');
            }
          } else {
            self.errorText(data.statusText + ' Unable to Access Earthquake Data.');
          }
        } else {
          self.errorText('Unable to Access Earthquake Data. Check Input Formatting. Note that Internal Firewalls may prevent access to 3rd party data.');
        }
      });

    return false;
  };

  // Load New York Times articles relevant to a quake, create Article
  // Objects from the first ten returned articles, and store these objects
  // in the articles array of that quake.
  this.loadNYT = function() {
    // We want articles from the two weeks after the quake.
    var quakeTime = self.currentLocation().time;
    // 86400000 = milliseconds in 1 day
    var addTime = 86400000 * 14;
    var withAddedTime = quakeTime + addTime;

    // The NYT requires date parameters to be formatted YYYYMMDD
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

    // Extract some relevant serch terms from the location of the quake;
    // Also search on the word "quake"
    var searchTerm = getSearchTerm(self.currentLocation().place);
    var fullSearchTerm = 'quake+' + searchTerm;
    self.currentLocation().prettySearchTerm(searchTerm.replace('+', ' '));

    // Generate the NYT URL.
    // I originally included the following "fq" parameter to limit
    // search results, but it proved unnecessary (and too limiting)
    // 'fq': "section_name:(\"World\" \"Front Page\" \"International\" \"Week in Review\" \"Opinion\")",
    var nytURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    nytURL += '?' + $.param({
      'api-key': "3579d2c108694c7fb536928a79360c54",
      'q': fullSearchTerm,
      'begin_date': startString,
      'end_date': endString,
      'fl': "headline,snippet,web_url"
    });

    $.getJSON( nytURL )
      .done(function(data) {
        var articles = data.response.docs;

        // If articles are found, make Article Objects and add to array
        // Note: results are returned in groups of ten
        if (articles.length > 0) {
          self.currentLocation().articlesFound(true);
          articles.forEach(function(art) {
            var articleObject = {
              headline: art.headline.main,
              snippet: art.snippet,
              artURL: art.web_url
            };
            var newArticle = new Article(articleObject);
            self.currentLocation().articles.push(newArticle);
          });

        // If no articles are found, create a "sorry" headline which
        // links to the NYT home page.  This fake article will prevent
        // future NYT searches for an already searched earthquake.
        } else {
          var sorryHeadline = " Go to New York Times Home Page";
          var articleObject = {
            headline: sorryHeadline,
            snippet: "",
            artURL: 'https://www.nytimes.com/'
          };
          var newArticle = new Article(articleObject);
          self.currentLocation().articles.push(newArticle);
        }
      })

      // If the NYT fails to load, alert user and encourage them
      // to try again
      .fail(function(data) {
        window.alert('New York Times failed to Load. Try Again!');
      });

    return false;
  };

  // Take the location (lat-lng co-ordinates) of a quake and use
  // Google Maps API Geocoder to find associated Place IDs.
  // Use these Place IDs to find photos of the region; make Photo Objects
  // from these photos, and push these objects onto the quake's photo array
  this.getPhotos = function(location) {
    var geocoder = new google.maps.Geocoder();
    var service = new google.maps.places.PlacesService(map);

    var latitude = location.lat;
    var longitude = location.lng;
    var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};

    geocoder.geocode({'location': latlng}, function(geoResults, geoStatus) {
      if (geoStatus === google.maps.GeocoderStatus.OK) {
        if (geoResults[0]) {
          // Limit resultant photos to those somewhat in the region of quake
          var numResultsToSearch = getNumGeocodesToSearch(geoResults.length);
          for (var i = 0; i < numResultsToSearch; i++) {
            var request = {
              placeId: geoResults[i].place_id
            };
            service.getDetails(request, function(placeResults, placeStatus) {
              if (placeStatus === google.maps.places.PlacesServiceStatus.OK) {
                if (placeResults.hasOwnProperty('photos')) {
                  self.currentLocation().photosFound(true);
                  placeResults.photos.forEach(function(photoItem) {
                    var photoUrl = photoItem.getUrl({'maxWidth': 600, 'maxHeight': 600});
                    var photoObject = {
                      url: photoUrl,
                      attribution: photoItem.html_attributions[0]
                    };

                    var newPhoto = new Photo(photoObject);
                    self.currentLocation().photos.push(newPhoto);
                  });
                }

              // if PlacesServiceStatus is NOT OK
              } else {
                // The Place Photos search only "fails" if something wierd
                // occurs, so we alert the user and suggest they try again.
                window.alert('Place Photos Search Failed due to ' + placeStatus + '\n\nTry Again.');
              }
            });
          }

        // A console statement, for those who really want to investigate,
        // if for some reason Geocoder status is OK, but there are no
        // geocoder results. The box which tells users no pictures are
        // available is already visible.
        } else {
          console.log('No Geocoder Results');
        }

      // If Geocoder Status is NOT OK
      } else {
        // If the GeoCoder failed due to zero results being returned,
        // don't bother with an alert window. We've already notified the
        // user that there are no results, and "zero result" alert windows
        // can pop up annoyingly often if a user is clicking locations
        // over water
        if (geoStatus !== 'ZERO_RESULTS') {
          window.alert('Geocoder Failed due to ' + geoStatus);
        }
      }
    });
  };

  // In order to meet the Project guidelines of displaying markers ONLOAD,
  // automatically begin loading earthquakes for the default search parameters.
  // I considered not loading quakes until I was sure Google Maps had loaded,
  // but I think that Google Maps WILL usually load, and that it is a good
  // idea to get the quakes loading as well so that they're more likely
  // to be available when the makeMarkers function is called
  this.loadEarthquakes();
};

var viewModel = new ViewModel();

ko.applyBindings(viewModel);


