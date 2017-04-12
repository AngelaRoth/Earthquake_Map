# QuakeZone

QuakeZone allows users to search for Earthquakes for a range of Dates and Magnitudes. Results are displayed both on a Map and in a List. The resulting list can be further refined by searching for specific terms in the earthquake place names.

Clicking either a quake's marker on the map or its name in the list displays additional information about the quake. At a minimum, this will include the time of the quake, its magnitude, and its [significance](#quake-significance). Ideally, New York Times articles from the two weeks following the quake and Photos of the Region will also be displayed.

Created as part of the Udacity Front-End Nanodegree.

## <a name="on-load">Note To Project Evaluator</a>

**On Load, QuakeZone currently displays all quakes since January 1, 2007 with a minimum magnitude of 7.5.**

QuakeZone is designed to search for Quakes on user input, but in keeping with the project requirement that "the app should display locations when the page is loaded," I have assigned initial values to "Start Date" and "Min Magnitude." I include a call to `this.loadEarthquakes()` at the end of my ViewModel class; this simulates clicking the app's "Get Earthquakes" button and pulls up, on load, all quakes since January 1, 2007 with a minimum magnitude of 7.5. Additional searches can still be performed; simply click the "New Search" button. [When this project is done, the screen shown when the "New Search" button is clicked will be the screen shown on-load, and no values will be pre-assigned to "Start Date" or "Min Magnitude."]

Note that mid-ocean and even some offshore quakes are unlikely to return **photos**. To see photos, click on quakes on land.

## 3rd Party APIs

QuakeZone uses data from the [US Geological Survey API](https://earthquake.usgs.gov/fdsnws/event/1/), the [New York Times API](https://developer.nytimes.com/), and the [Google Maps API](https://developers.google.com/maps/).

### Error Handling

1. **Google Maps:** If the Google Maps API fails to load, all that is shown aside from the header is a "Sorry" screen which encourages the user to check their internet connection and try again.

2. **Google Maps Geocoder:** If the returned Geocoder status is not `OK`, and the status is not `ZERO_RESULTS`, we alert the user of the failure and the reason for it. If the status is `ZERO_RESULTS`, no special alert is created. The lat-lng co-ordinates of many under-ocean quakes return zero Geocoder results; constantly alerting users of this fact is annoying, and serves no purpose because we already inform the user if no pictures are available (and the Geocoder call is only there to help find pictures).

3. **Google Maps PlacesService:** If the returned PlacesService status is not `OK` (which happens rarely, and only when some glitch has occurred), we alert the user of the failure and the reason for it, and encourage them to try again.

4. **USGS Earthquake API:** If our request to the USGS API fails, we parse the returned data and try to create a succinct, user-legible reason for the failure. Most likely, the user has entered less-than-ideal search terms, either not formatting them correctly, or entering terms which produce zero or far too many quakes. If this is the case, we notify them of their exact mistake and encourage them to try again. If the returned data can't be parsed for a succinct, user-legible reason, we notify the user of the full status text and inform them that the Earthquake Data is unavailable. If the returned data doesn't even contain a statusText property, we show the user a general message which mentions input formatting and the potential problem of firewalls. All "error" text is displayed in a gold-backed box above the "search for earthquakes" form.

5. **New York Times API:** If our request to the NYT API fails, we alert the user that the New York Times failed to load and encourage them to try again.

6. **No Photos or No Articles Exist:** If the APIs all work OK, but either no photos or no articles exist for a location, the user is informed in a little green-backed (photos) or blue-backed (articles) notification box, displayed in the main flow of the site.

## Loading QuakeZone

The site is hosted on [GitHub's gh-pages](https://angelaroth.github.io/Earthquake_Map/). Alternately, QuakeZone can be run by loading index.html into your local browser.

## Using QuakeZone

### On Mobile (Screens with Width of less than 800px)

The black-backgrounded box which contains all search forms and results can be toggled in and out at any time using the in/out arrow in the header. Toggling the box open or closed does not change the information displayed therein. If an action is performed which changes the information in the box (i.e. a location name or marker is clicked), the box will automatically toggle open, with the new information displayed.

[On screens of width greater than 800px, the information box remains open at all times.]

### The Initial Search for Earthquakes

**NOTE:** For this assignment, the initial search is performed automatically using pre-set dates and magnitudes. See [Note to Project Evaluator](#on-load).

#### Searching for Earthquakes:

Click "New Search" to be presented with a screen which asks you to search for Earthquakes. Fill in the form with the time period and range of magnitudes you wish to search and hit the "Get Earthquakes" button. [After the course project is completed, the "New Search" screen will be presented on load.]

* Times must be in the format: YYYY-MM-DD
* Magnitudes can be integer or decimal numbers

A list of all earthquakes which satisfy your search parameters should be displayed, with corresponding map markers at each earthquake location. If something goes wrong with your search, you will be notified and asked to try again.

#### Possible reasons for failure include:

* No quakes returned due to search parameters being too narrow
* Too many quakes returned due to search parameters being too broad (more likely!)
* Incorrectly entered search parameters

#### Fewer Quakes on Record in the More Distant Past

Searches from fifty years ago produce significantly fewer results, especially in the low magnitudes, and especially for locations outside North America. Bear in mind that searches for long ago Quakes will not be as comprehensive as searches of recent years.

#### Sample Searches which Return Manageable Results:

The _Disaster Area_ Search (returns 16 Quakes):

* Start Date: 1900-01-01 (default if no start entered)
* End Date: (none entered)
* Min Magnitude: 8.5
* Max Magnitude: (none entered)

The _It's My Birthday_ Search (may Return a couple hundred Quakes or only a few, depending on how old you are!)

* Start Date: Your Birthday
* End Date: The Day Following your Birthday
* Min Magnitude: (none entered)
* Max Magnitude: (none entered)

### The Earthquakes

#### Map Markers

Map Markers are coloured according to the Significance of the quake. <a name="quake-significance">**Quake Significance**</a> is determined by factors such as magnitude, maximum estimated instrumental intensity, felt reports, and estimated impact. Significance may be close to zero for quakes of very small magnitude, or over 2000 for large quakes in populated areas. Marker colours correspond to the following significances:

* Red: 1800 and Over
* Dark Orange: 1500-1799
* Orange: 1200-1499
* Light Orange: 900 - 1199
* Yellow: 600 - 899
* Green: Under 600

#### Earthquake List

The list of Quakes can be further refined by entering a search term into the input field above the list. This will return a new, more specific subset of quakes which match the search term. The map also updates to display only markers which match the search.

At any time, the full results list can be seen by clicking the "All Results" button in the red header.

### Information on a Specific Quake

Clicking either a map marker or a name in the list of locations will display information on the quake. This includes the time of the quake, its magnitude, and its [significance](#quake-significance). Ideally, New York Times articles from the two weeks following the quake and Photos of the Region will also be displayed. However, articles and photos may not be found for quakes which are too small, or too remote, or which happened too long ago. Photos, especially, are rare for Quakes which happened below the ocean floor; they are sourced from the Google Places Library, and not many photos are posted of blank ocean!

* ADDITIONAL NOTE ON PHOTOS: Be aware that photos are only as reliable as the Google users who upload them. Clicking on Iceland quakes, for instance, is liable to get you a photo of footballer Ronaldo hoisting a trophy.

Clicking the "Back to Search Results" button at the top of the information box will bring you back to your most recent subset of quakes. As always, clicking the "All Results" button in the header will return the full list of quakes from your initial search.

### Seeing a Bigger Image

Like a particular photo? You can click it to see a larger (fully opaque!) version. Enlarged photos are a maximum of 600px wide and 600px high; for smaller screens, they are as large as the screen allows.

### A Brand New Search

At any time, a new range of dates and magnitudes may be searched by clicking the "New Search" button in the red header.

If you click this button by mistake and want to go back to your results list, just click "All Results." As long as you haven't actually performed a new search, clicking "All Results" will display the full results of your most recent search.

## Future Version 2.0

Some aspects of this site are adequate for demonstrating knowledge of programming concepts, but might be rethought for the next version:

* A number of New York Times articles appear to be from 3rd party news agencies, and are "No Longer Available" on the NYT website. The headlines and "snippets" are still available, but clicking on the url link brings sad disappointment. I am going to investigate the [Reuters API](https://newsapi.org/reuters-api): perhaps they better maintain their links.  [Ironically, the "No Longer Available" issue seems to be more of a problem for more recent quakes; articles for quakes from 10 years ago seem to be more reliably available. Perhaps this is due to the NYT "transferring" articles from current to archive status, or perhaps they now rely on 3rd party sources more than they did in the past.]

* My goal with the photos is to give users a "feel" for the region which was hit, beyond "in-the-moment disaster scenes." I hoped that Reverse Geocoding on a lat-long would give me place IDs close to that lat-long; and that the Places API would then return pictures in the vicinity of that Place ID.  I knew that the pictures would not be RIGHT AT that lat-long, but I thought they'd be close. However, Place IDs seem to be returned for ever-expanding rings of "relevance," beginning with the immediate lat-lng and moving out toward "greater region," "State," and "Country." If only one Place ID is returned, it is probably for the country. If five are returned (i.e. for a Quake in Idaho), the fifth will probably be for "The United States" and the fourth will be for "Idaho," both of which are too big to return "close-to-the-Quake" photos. With this in mind, I have implemented code to disregard the "broader-reaching" Place IDs, but this code is still not perfect. Consider: Indicating on the map the extent of the region the photos are from.

* Currently, my Knockout "if" bindings work well at determining which portion of the HTML is displayed. However, on page load there can be a quarter-second "jumbled display of everything" before the JavaScript loads and the "if" conditionals are defined. This might be improved with a little CSS band-aid which briefly hides all the HTML jumble until the JavaScript is ready.

* Knockout Utility Functions, such as `arrayFilter`, might be used to filter list of Quakes according to search criteria.

* A few more "fail-safe" buttons, such as one which will allow users to see the details of their "previously viewed" location, might be added.
