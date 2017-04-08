# QuakeZone

QuakeZone allows users to search for Earthquakes between a range of Dates and Magnitudes, then displays these quakes both on a Map and in a list. The list can be narrowed down by searching for specific terms in the earthquake place names.

Clicking either a quake's marker on the map or its name in the list will display additional information about the quake. At a minimum, this will include the time of the quake, its magnitude, and its significance (quake significance is determined by factors such as magnitude, maximum estimated instrumental intensity, felt reports, and estimated impact; larger numbers indicate a more significant event). Ideally, New York Times articles from the two weeks following the quake and Photos of the Region will also be displayed.

Created as part of the Udacity Front-End Nanodegree.

## 3rd Party APIs

QuakeZone uses data from the [US Geological Survey API](https://earthquake.usgs.gov/fdsnws/event/1/), the [New York Times API](https://developer.nytimes.com/), and the [Google Maps API](https://developers.google.com/maps/).

## Using QuakeZone



## Version 2.0

Some aspects of this site are adequate for demonstrating knowledge of programming concepts, but could be improved in the next version:

* A lot of the New York Times articles appear to be from 3rd party news agencies, and are "No Longer Available" on the NYT website. The headlines and "snippets" are still available, but clicking on the url link brings sad disappointment. I am going to investigate the [Reuters API](https://newsapi.org/reuters-api): perhaps they better maintain their links.  [Ironically, the "No Longer Available" issue seems to be more of a problem for more recent quakes (i.e. in the last 6 months); articles for quakes from 10 years ago seem to be more reliably available. Perhaps this is due to the NYT "transferring" articles from current to archive status, or perhaps they are now relying on 3rd party sources more than they did 10 years ago.]

* I thought that Reverse Geocoding on a lat-long would give me place IDs close to that lat-long; and that the Places API would then return pictures in the vicinity of that Place ID.  I knew that the pictures would not be RIGHT AT that lat-long, but I thought they'd be close. However, locations on the Chilean coast, for example, return the same photos even though they are a good distance apart. I might have to rethink which photos I select. [My goal with the photos is to give users a "feel" for the region which was hit, beyond "in-the-moment disaster scenes."]
