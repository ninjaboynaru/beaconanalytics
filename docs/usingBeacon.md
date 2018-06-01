
### Using beacon
To use Beacon to gather usage statistics, add [beacon.js](../app/beacon.js) to your site.  
Then from somewhere in your JavaScript code, call ```beaconAnalytics.init(key, serverUrl)```.  


### Click Statistics
Beacon is capable of gathering data about what users are clicking on. It does this by having the items to be clicked on, named and grouped.  

To have beacon gather data about how many times an element is clicked, add the **beacon-click** and **beacon-click-category** to the elements in question.  

- **beacon-click** should be set to a unique name to identify that element
- **beaon-click-category** should be the category the element belongs to, for example *navigation*, or *videos*
- **beacon-click** MUST be unique but **beacon-click-category** does not have to be unique.

### Dynamic Content
If your site dynamically adds and removes content, for example with React, you can just call ```beaconAnalytics.init(key, serverUrl)``` again as many times as you want.
