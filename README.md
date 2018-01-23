

## Beacon Analytics
Beacon Analytics is a simple, custom analytics solution.  

Beacon is capable of recording basic usage statistics such as total user sessions, average session duration, browser, device and os statistics, and what elements and groups of elements users are clicking on.  

Beacon is also capable of resuming a users' session if they leave the website and return **(within a short period of time)**.

### Closed Shop
Currently Beacon is closed to the public and designed is only to work on a single website, [my portfolio site]().

The authorization keys are hard coded into a config file and recorded user data is not differentiated by origin.


### Overview
Beacon uses WebsSckets to record usage data. No personally identifiable data is recorded. Only already openly available data is recorded, such as the users' User Agent string, or their screen size and click data.

The backend REST API transforms the raw data obtained by the WebsSckets into useful analytics/statistics data and then responds with the data.  

Beacon does its best to parse certain data out of the User Agent but this my not always be reliable.

The REST API can return the fallowing data:  
- General overview, such as the average user session duration, the avg user break duration, and the total ammount of sessions.
- Statistics data about browser, os, device, and referrals
- Statistics data about user clicks. Using HTML attributes, buttons and other element on a website can be grouped into categories and given item ids. The REST API can then return data about which item had the most clicks compared to other items in its category and so on.


### REST API
See [api.md](docs/api.md) for API documentation

### Config Files
See [config.md](docs/config.md) for instructions on setting up config files

### Tools Used
- MOCHA for testing
- MongoDB database
- Front end site is bundled with Webpack and styled with SCSS

### How to use Beacon on a website
1. Add [beacon.js](app/beacon.js) to the website
2. Call ``` beaconAnalytics.init()``` from somewhere in your JavaScript. If the DOM is not loaded, Beacon will wait until the dome is loaded and then initialize.
3. See [usingBeacon.md](docs/usingBeacon.md) for more details and for how to implement click data.  

### TODO
- Add documentation for config files
