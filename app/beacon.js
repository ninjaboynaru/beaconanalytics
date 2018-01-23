
// v1.0.0

const beaconAnalytics = {

	_key: 'afb51b19',
	_serverUrl: 'ws//beaconanalytics.herokuapp.com/',
	_socket: null,

	_socketStates: {
		CONNECTING: 0,
		OPEN: 1,
		CLOSING: 2,
		CLOSED: 3
	},


	_initSocket: function init() {
		let socket = this._socket;
		const socketStates = this._socketStates;

		if(socket && socket.readyState != socketStates.CLOSING && socket.readyState != socketStates.CLOSED)
		{
			return;
		}

		socket = new WebSocket(this._serverUrl);
		this._socket = socket;

		socket.addEventListener('open', function(){
			const authData = JSON.stringify({dataType:0, key:this._key});
			const screenData = JSON.stringify({dataType:1, screenSize:{width:window.screen.width, height:window.screen.height}});
			const referrerData = JSON.stringify({dataType:2, referrer:document.referrer});

			socket.send(authData);
			socket.send(screenData);
			socket.send(referrerData);
		}.bind(this) );

		socket.addEventListener('message', function(messageEvent){
			let data;
			try {
				data = JSON.parse(messageEvent.data);
			}
			catch(e) {
				return;
			}

			if(data.error)
			{
				console.error('beacon-analytics received error from the analytics server: ', data.error);
			}
		});

		socket.addEventListener('close', function(){
			this._socket = null;
		}.bind(this));

		socket.addEventListener('error', function(error){
			console.error('beacon-analytics websocket error: ', error);
			socket.close();
		});

	},


	_initDomEvents: function initDomEvents()
	{
		if(document.readyState == 'loading')
		{
			document.addEventListener('DOMContentLoaded', addDomEvents.bind(this));
		}
		else
		{
			addDomEvents.bind(this)();
		}

		function addDomEvents()
		{
			const clickEventNodes = document.querySelectorAll('[beacon-click]');

			for(let node of clickEventNodes)
			{
				node.removeEventListener('click', this._sendClickEvent);
				node.addEventListener('click',  this._sendClickEvent);
			}
		}
	},


	_sendClickEvent: function sendClickEvent(event)
	{
		const itemId = event.target.getAttribute('beacon-click');
		const itemCategory = event.target.getAttribute('beacon-click-category');

		if(itemId == false)
		{
			return;
		}
		else if(this._socket.readyState != this._socketStates.OPEN)
		{
			return;
		}

		const clickData = JSON.stringify({
			dataType:3,
			itemId: itemId,
			itemCategory: itemCategory
		});
		this._socket.send(clickData);
	},


	init: function init() {
		beaconAnalytics._initDomEvents.bind(beaconAnalytics)();
		beaconAnalytics._initSocket.bind(beaconAnalytics)();
	}
}
beaconAnalytics._sendClickEvent = beaconAnalytics._sendClickEvent.bind(beaconAnalytics);
