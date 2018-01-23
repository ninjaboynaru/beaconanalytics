## Beacon REST API
The Beacon REST API is composed of 2 endpoints
- *data/:key/overview*
- *data/:key/stats*

### Authorization
At the moment, all credentials **(authorization keys and their allowed domains)**, are hard coded in a config file. Beacon is not meant for public usage.


### Overview Endpoint
*data/:key/overview* returns general statistics data about overall usage.  
The data returned is
- The average session duration
- The average break duration (if the user leaves the website and returns, how long were they gone?)
- Total sessions

##### Response
The response is a JSON object matching the fallowing
```javascript
{
	total: number,
	avgSessionDuration: number,
	avgBreakDuration: number
}
```

### Stats Endpoint
*data/:key/stats* returns statistics on a specified statType.  
The type of statistics to return is specified using the **?statType** query string.  
Possible **statType** values are:  
- browser
- os
- device
- referrer

> EXAMPLE  
> data/1234/stats/?statType=browser

##### Response
The response is a JSON array of objects matching the fallowing
```javascript
	{
		name: string,
		total: number,
		percent: number
	}
```
If the requested statType was browser the **name** property wold be something like Firefox, or Chrome.


### Stats ALL endpoints
If accessing the [stats endpoint](#stats-endpoint) and the **statType** query string is specified as **all** then statistics about all the statTypes will be returned
> EXAMPLE
> data/1234/stats/?statType=all

##### Response
The response is a JSON object matching the fallowing
```javascript
{
	browser:[
		{
			name:'Firefox',
			total:10,
			percent:12.9323
		},
		{
			name:'Chrome',
			total:34,
			percent:62.9323
		}
		...etc...
	]
	os:[...//same object structure as above]
	device:[...//same object structure as above],
	referrer:[...//same object structure as above]
}
```

### Stats Clicks endpoints
If accessing the [stats endpoint](#stats-endpoint) and the **statType** query string is specified as **click** then statistics about all the clicks will be returned
> EXAMPLE
> data/1234/stats/?statType=click

##### Response
NOT YET DOCUMENTED  
Use manual tests to see the response structure.

### Query Parameters
ALL endpoints accept the fallowing **optional** query parameters
- *?count=* - How many results to return. If not specified, to large, or invalid, a default count will be used.

- *?from=* - A unix time stamp **IN MILISECONDS**. Only user sessions that occurred after this time will be analyzed.

- *?to=* - A unix time stamp **IN MILISECONDS**. Only user sessions that occurred before this time will be analyzed.

- If either *?from* or *?to* are not valid timestamps or one is specified without the other, a default time range will be used of 2 months ago up to the today.
