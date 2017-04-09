# QuakeZone

QuakeZone allows users to search for Earthquakes between a range of Dates and Magnitudes, then displays these quakes both on a Map and in a list. The list can be narrowed down by searching for specific terms in the earthquake place names.

Clicking either a quake's marker on the map or its name in the list will display additional information about the quake. At a minimum, this will include the time of the quake, its magnitude, and its significance (quake significance is determined by factors such as magnitude, maximum estimated instrumental intensity, felt reports, and estimated impact; larger numbers indicate a more significant event). Ideally, New York Times articles from the two weeks following the quake and Photos of the Region will also be displayed.

Created as part of the Udacity Front-End Nanodegree.

## 3rd Party APIs

QuakeZone uses data from the [US Geological Survey API](https://earthquake.usgs.gov/fdsnws/event/1/), the [New York Times API](https://developer.nytimes.com/), and the [Google Maps API](https://developers.google.com/maps/).

## Loading QuakeZone

The site is hosted on [GitHub's gh-pages](https://angelaroth.github.io/Earthquake_Map/). Alternately, QuakeZone can be run by loading index.html into your local browser.

## Using QuakeZone

### On Mobile (Screens with Width of less than 800px)

The black-backgrounded box which contains all search forms and results can be toggled in and out at any time using the in/out arrow in the header. Toggling the box open or closed does not change the information displayed in the box. If an action is performed which changes the information in the box (i.e. a location name or marker is clicked), the box will automatically toggle open, with the new information displayed.

### The Initial Search for Earthquakes

On load, you will be presented with a screen which asks you to search for Earthquakes. Fill in the form with the time period and range of magnitudes you wish to search and hit the "Get Earthquakes" button.

* Times must be in the format: YYYY-MM-DD
* Magnitudes can be integer or decimal numbers

A list of all earthquakes which satisfy your search parameters should be displayed, with corresponding map markers at each earthquake location. If something goes wrong with your search, you will be notified and asked to try again.

#### Possible reasons for failure include:

* No quakes returned due to search parameters being too narrow
* Too many quakes returned due to search parameters being too broad (more likely!)
* Incorrectly entered search parameters

#### Fewer Quakes on Record in the More Distant Past

Searches from fifty years ago produce significantly fewer results, especially in the low magnitudes, and especially for locations outside North America. Bear in mind that searches for long ago Quakes will not be as comprehensive as searches of recent years.

#### Sample Searches which Return Managable Results:

The Disaster Area Search (returns 16 Quakes):

* Start Date: 1900-01-01 (default if no start entered)
* End Date: (none entered)
* Min Magnitude: 8.5
* Max Magnitude: (none entered)

The "It's My Birthday" Search (may Return a few or a couple hundred Quakes, depending how old you are!)

* Start Date: Your Birthday
* End Date: The Day Following your Birthday
* Min Magnitude: (none entered)
* Max Magnitude: (none entered)

### The Earthquake List

The returned list of quakes can be further searched by entering a search term into the input field above the list. This will return a new, more specific subset of quakes which match the search term. The map will also update to only show markers for the new subset of quakes.

At any time, the full results list can be seen by clicking the "All Results" button in the red header.

### Information on a Specific Quake

Clicking either a map marker or a name in the list of locations will display information on the quake. This includes the time of the quake, its magnitude, and its significance (quake significance is determined by factors such as magnitude, maximum estimated instrumental intensity, felt reports, and estimated impact; larger numbers indicate a more significant event).
Ideally, New York Times articles from the two weeks following the quake and Photos of the Region will also be displayed. However, articles and photos may not be found for quakes which are too small, or too remote, or which happened too long ago.

Clicking the "Back to Search Results" button at the top of the information box will bring you back to your most recent subset of quakes. As always, clicking the "All Results" button in the header will return the full list of returned quakes.

### Seeing a Bigger Image

Like a particular photo? You can click it to see a larger (fully opaque!) version. Enlarged photos are a maximum of 600px wide and 600px high; for smaller screens, they are as large as the screen allows.

### A Brand New Search

At any time, a new range of dates and magnitudes may be searched by clicking the "New Search" button in the red header.

If you click this button by mistake and want to go back to your results list, just click "All Results." As long as you haven't actually performed a new search, clicking "All Results" will display the full results of your most recent search.

## Future Version 2.0

Some aspects of this site are adequate for demonstrating knowledge of programming concepts, but could be improved in the next version:

* A lot of the New York Times articles appear to be from 3rd party news agencies, and are "No Longer Available" on the NYT website. The headlines and "snippets" are still available, but clicking on the url link brings sad disappointment. I am going to investigate the [Reuters API](https://newsapi.org/reuters-api): perhaps they better maintain their links.  [Ironically, the "No Longer Available" issue seems to be more of a problem for more recent quakes (i.e. in the last 6 months); articles for quakes from 10 years ago seem to be more reliably available. Perhaps this is due to the NYT "transferring" articles from current to archive status, or perhaps they are now relying on 3rd party sources more than they did 10 years ago.]

* My goal with the photos is to give users a "feel" for the region which was hit, beyond "in-the-moment disaster scenes." I hoped that Reverse Geocoding on a lat-long would give me place IDs close to that lat-long; and that the Places API would then return pictures in the vicinity of that Place ID.  I knew that the pictures would not be RIGHT AT that lat-long, but I thought they'd be close. However, Place IDs seem to be returned for ever-expanding rings of "relevance," beginning with the immediate lat-lng and moving out toward "greater region," "State," and "Country." If only one Place ID is returned, it is probably for the country. If five are returned (i.e. for a Quake in Idaho), the fifth will probably be for "The United States" and the fourth will be for "Idaho," both of which are too big to return "close-to-the-Quake" photos. With this in mind, I have implemented code to disregard the "broader-reaching" Place IDs, but this code is still not perfect. Consider: Drawing on map the region photos are from.

* Consider adding a few more "fail-safe" buttons, such as one which will allow users to see the details of their "previously viewed" location.
