const ws = require('ws');


function testWS(expect, hostName, testingKey) {
	const wsURL = `ws://${hostName}`;
	const headers = {
		'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0',
		'accept-language': 'en-US,en;q=0.5'
	}
	let websocket;

	describe('User session websocket tests', function(){
		let sessionHash;


		it('Can connect to websocket server', function(done){
			websocket = new ws(wsURL, {headers:headers});
			websocket.onerror = function(error){
				expect.fail(null, null, 'Failed to connect to websocket server. Error: ' + error);
				done();
			}
			websocket.onopen = function onOpen(){
				expect(websocket.readyState).to.equal(1);
				done();
			}
		});

		it('Can send authorization msg and get session object back', function(done){
			const authData = JSON.stringify({dataType:0, key:testingKey});
			websocket.send(authData);
			websocket.onmessage = function(message){
				const data = JSON.parse(message.data);

				expect(data.error).to.not.exist;
				expect(data.session).to.a('object');
				expect(data.session.userAgent).to.equal(headers['user-agent']);

				expect(data.session.browser).to.be.a('string');
				expect(data.session.browser.toLowerCase() ).to.equal('firefox');

				expect(data.session.os).to.be.a('string');
				expect(data.session.os.toLowerCase() ).to.equal('windows');

				expect(data.session.hash).to.be.a('string');
				sessionHash = data.session.hash;

				expect(Date.parse(data.session.sessionStartTime) ).to.be.below(Date.now() + 1);
				expect(data.session.sessionEndTime).to.not.exist;

				done();
			}
		});

		it('Can send screen size msg and get session object back', function(done){
			const screenSizeData = JSON.stringify({dataType:1, screenSize:{width:1024, height:768}});

			websocket.send(screenSizeData);
			websocket.onmessage = function(message) {
				const data = JSON.parse(message.data);

				expect(data.error).to.not.exist;
				expect(data.session).to.be.a('object');
				expect(data.session.screenSize, 'The "screenSize" property of the server response is not the "screenSize" data that was sent').to.deep.equal({width:1024, height:768});

				done();
			}
		});

		it('Can send referrer msg and get session object back', function(done){
			const referrSite = 'www.addsite.com';
			const referrerData = JSON.stringify({dataType:2, referrer:referrSite});

			websocket.send(referrerData);
			websocket.onmessage = function(message) {
				const data = JSON.parse(message.data);

				expect(data.error).to.not.exist;
				expect(data.session).to.be.a('object');
				expect(data.session.referrer, 'The "referrer" property of the server response is not the "referrer" data that was sent').to.equal(referrSite);


				done();
			}
		});

		it('Can send click msg and get session object back', function(done){
			const itemId = 'sample-id';
			const itemCategory = 'sample-category';
			const clickData = JSON.stringify({dataType:3, itemId:itemId, itemCategory:itemCategory});

			websocket.send(clickData);
			websocket.onmessage = function(message) {
				const data = JSON.parse(message.data);

				expect(data.error).to.not.exist;
				expect(data.session).to.be.a('object');
				expect(data.session.clicks).to.have.length(1);
				expect(data.session.clicks[0]).to.be.a('object');
				expect(data.session.clicks[0]).to.have.property('itemId', itemId);
				expect(data.session.clicks[0]).to.have.property('itemCategory', itemCategory);

				done();
			}
		});

		it('Can close the connection, reconnect, and get same session object back', function(done){
			websocket.close();
			websocket.onclose = function(){
				websocket = new ws(wsURL, {headers:headers});
				websocket.onopen = onSocketOpen;
				websocket.onmessage = onSocketMessage;
			};

			function onSocketOpen() {
				const authData = JSON.stringify({dataType:0, key:testingKey});
				websocket.send(authData);
			}
			function onSocketMessage(message) {
				const data = JSON.parse(message.data);

				expect(data.error, 'WS Server has responded with an error while attempting to reconnect').to.not.exist;
				expect(data.session).to.be.a('object');
				expect(data.session.hash, 'The session returned by the server is not the same sesison that was previosly beaing used').to.equal(sessionHash);
				expect(data.session.clicks).to.have.length(1);
				expect(data.session.breaks).to.have.length(1);
				websocket.close();

				done();
			}
		});


	});

}


module.exports = testWS;
