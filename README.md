

## Beacon Analytics
Beacon Analytics is a simple, custom analytics solution.  

Beacon is capable of recording basic usage statistics such as total user sessions, average session duration, browser, device and os statistics, and what elements and groups of elements users are clicking on.  

Beacon is also capable of resuming a users' session if they leave the website and return **(within a short period of time)**.

### Overview
Beacon uses WebSockets to record usage data. No personally identifiable data is recorded. Only already openly available data is recorded, such as the users' User-Agent string, or their screen size and click data.

The backend REST API transforms the raw data obtained by the WebsSckets into useful analytics/statistics data and then responds with the data.  

Beacon does its best to parse certain data out of the User Agent but this may not always be reliable.

The REST API can return the following data:  
- General overview, such as the average user session duration, the avg user break duration, and the total amount of sessions.
- Statistics data about browser, os, device, and referrals
- Statistics data about user clicks. Using HTML attributes, buttons and other elements on a website can be grouped into categories and given item ids. The REST API can then return data about which item had the most clicks compared to other items in its category and so on.


### REST API
See [api.md](docs/api.md) for API documentation

### Building the front end
The front end JavaScript is bundled using Webpack. Webpack injects the API key into the JavaScript using its `definePlugin` feature. Before building the front end, make sure you've defined a `key` env variable. Also make sure that when you go to host your server, the `key` env variable in your server environment is the same that was used when bundling the front end JavaScript.

### How to use Beacon on a website
1. Add [beacon.js](app/beacon.js) to your website
2. Call ``` beaconAnalytics.init(key, serverUrl)``` from somewhere in your JavaScript. If the DOM is not loaded, Beacon will wait until the DOM is loaded and then initialize. Make sure you pass in the correct key and the correct server URL. The key you pass it should have been defined as an `env` variable in the server environment.  
3. See [usingBeacon.md](docs/usingBeacon.md) for more details and for how to implement click data.
