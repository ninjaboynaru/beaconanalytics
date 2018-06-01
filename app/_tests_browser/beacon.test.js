

describe('Beacon.js', function(){

	const expect = chai.expect;
	const sandbox = sinon.createSandbox();

	const btnItemId = 'test-item';
	const btnItemCategory = 'test-category';
	let btn;
	let stubSend;


	before('Setup test btn', function(){
		btn = document.createElement('button');
		document.body.appendChild(btn);
		btn.setAttribute('style', 'visibility:hidden');
		btn.setAttribute('beacon-click', btnItemId);
		btn.setAttribute('beacon-click-category', btnItemCategory);
	});


	before('Fake the WebSocket object', function(){
		stubSend = sandbox.stub(window.WebSocket.prototype, 'send');

		stubSend.callsFake(function(data){
			console.log('WebSocket data send:', data);
			this.readyState = 1;
		});
		sandbox.stub(window.WebSocket.prototype, 'addEventListener').callsFake(function(event, fn){
			if(event == 'open')
			{
				fn();
			}
		});
		sandbox.stub(window.WebSocket.prototype, 'readyState').get(function(){
			return 1;
		})
	});


	after('Restore sandbox', function(){
		sandbox.restore();
	});


	it('Sends correct analytics data', function(){
		// NOTE: You must run the server and the key env variable temporarily set to *
		beaconAnalytics.init('*', 'ws://localhost:8080');
		expect(stubSend).callCount(3);

		const sendCalls = stubSend.getCalls();

		expect(sendCalls[0].args).to.have.lengthOf(1);
		expect(sendCalls[1].args).to.have.lengthOf(1);
		expect(sendCalls[2].args).to.have.lengthOf(1);

		let tempJson;
		const screenSize = {width:window.screen.width, height:window.screen.height};
		const referrer = document.referrer;

		tempJson = JSON.parse(sendCalls[0].args[0]);
		expect(tempJson, 'First data send, did not have dataType property set to 0 (auth dataType) ').to.have.property('dataType', 0);

		tempJson = JSON.parse(sendCalls[1].args[0]);
		expect(tempJson, 'Second data send, did not have dataType property set to 1 (screenSize dataType)').to.have.property('dataType', 1);
		expect(tempJson, 'Second data send, did not have correct screenSize property').to.have.deep.property('screenSize', screenSize);

		tempJson = JSON.parse(sendCalls[2].args[0]);
		expect(tempJson, 'Third data send, did not have dataType property set to 2 (referrer dataType)').to.have.property('dataType', 2);
		expect(tempJson, 'Third data send, did not have correct referrer property').to.have.deep.property('referrer', referrer);
	});


	it('Sends correct data when btn is pressed', function(){
		btn.click();

		expect(stubSend).callCount(4);

		const thirdCall = stubSend.getCall(3);
		expect(thirdCall.args).to.have.lengthOf(1);

		const json = JSON.parse(thirdCall.args[0]);
		expect(json, 'Btn data send, did not have dataType property set to 3 (click event dataType)').to.have.property('dataType', 3);
		expect(json, 'Btn data send, did not have correct itemId property').to.have.property('itemId', btnItemId);
		expect(json, 'Btn data send, did not have correct itemCategory property').to.have.property('itemCategory', btnItemCategory);


	});


});
