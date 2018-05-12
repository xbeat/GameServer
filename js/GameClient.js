
'use strict';

// ------------ Globals ------------
let RAF;

let EXECUTERAF = true;

let cxClient = 460;//600
let cyClient = 290;//380

let Color = {
	WHITE: "255, 255, 255",
	BLACK: "0, 0, 0"
};

let canvas = document.createElement( "canvas" );
document.body.appendChild( canvas );

canvas.id = "canvasPitchAI";
canvas.style.position = "fixed";
canvas.style.bottom = "10px";
canvas.style.left = "50%";
canvas.style.margin = "0 auto";
canvas.style.zIndex = "30";
canvas.style.transform = "translate( -50%, 0 )";

canvas.width = cxClient;
canvas.height = cyClient;
let context = canvas.getContext( '2d' );
context.clearRect( 0, 0, canvas.width, canvas.height ); 
gdi.StartDrawing( context );

let g_SoccerPitch = null;
var ball = null;
var red = null;
var blue = null;
let scene3D = new Scene3D();

// resize Scene 3D
window.addEventListener( 'resize', function () {
	scene3D.camera.aspect = window.innerWidth / window.innerHeight;
	scene3D.camera.updateProjectionMatrix();
	scene3D.renderer.setSize( window.innerWidth, window.innerHeight );
}, false);

//--------------- update ---------------
let timer = new PrecisionTimer();
//start the timer
timer.Start();

//----------- Entry Point -----------
function step() {

	RAF = requestAnimationFrame( step );

	//update
	if ( timer.ReadyForNextFrame() ) {

		if ( EXECUTERAF === true ){

			g_SoccerPitch.Render();

		};

	};

};

// start websocket
let HOST = location.origin.replace( /^http/, 'ws' );
let socket = new WebSocket( HOST + '/?serverState=state', 'echo-protocol' );

// listening for server response
socket.onmessage = function ( message ) { 

	if ( ball == null || red == null || blue == null ) return; // wait for 3D instantiated

	let obj = JSON.parse( message.data );

	if( typeof( obj.player ) !== "undefined" ) {

		switch( obj.player.state ) {
			
			case "connected":
				document.getElementById( "state" ).innerText = "Connected";
				gameclient.update( { state: "Connected" } );
				break;

			case "shoot":
			case "reset":
			case "receive":
			case "wait":
				document.getElementById( "state" ).innerText = obj.player.data.player.state;
				gameclient.update( obj );
				break;

		};

	};

	if( typeof ( obj.e ) !== "undefined" ) {

		let color = obj.C == "r" ? "red" : "blue";
		
		switch( obj.e ) {

			case "B"://Ball
				//document.getElementById( "state" ).innerText = obj.e;
				ball.m_vPosition.set( obj.P );
				break;

			case "F"://FieldPlayer
				//document.getElementById( "state" ).innerText = obj.e;
				window[ color ].m_Players[ obj.I ].m_vPosition.set( obj.P );

				window[ color ].m_Players[ obj.I ].m_vVelocity.x = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.x - window[ color ].m_Players[ obj.I ].m_lastPosition.x ); 
				window[ color ].m_Players[ obj.I ].m_vVelocity.y = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.y - window[ color ].m_Players[ obj.I ].m_lastPosition.y );
				window[ color ].m_Players[ obj.I ].m_lastPosition.set( obj.P );
				
				window[ color ].m_Players[ obj.I ].m_vHeading.set( obj.H );
				window[ color ].m_Players[ obj.I ].m_vSide = window[ color ].m_Players[ obj.I ].m_vHeading.Perp();
				break;

			case "G"://GoalKeeper
				//document.getElementById( "state" ).innerText = obj.e;
				window[ color ].m_Players[ obj.I ].m_vPosition.set( obj.P );

				window[ color ].m_Players[ obj.I ].m_vVelocity.x = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.x - window[ color ].m_Players[ obj.I ].m_lastPosition.x ); 
				window[ color ].m_Players[ obj.I ].m_vVelocity.y = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.y - window[ color ].m_Players[ obj.I ].m_lastPosition.y );
				window[ color ].m_Players[ obj.I ].m_lastPosition.set( obj.P );

				window[ color ].m_Players[ obj.I ].m_vLookAt.set( obj.L );
				break;
		
		};

	};

};

// listening for any socket error
socket.onerror = function ( error ) { 

	console.log( 'WebSocket error: ' + error );

};

// ------------ queue class ---------
/*
class Queue {

	constructor() {
		this.redTeam = new Array();
		this.blueTeam = new Array();
	};

	add( action, team ) {
		this[team].unshift( action );
	};

	remove( team ) {
		this[team].pop();
	};

	first( team ) {
		return this[team][ 0 ];
	};

	last( team ) {
		return this[team][ this[team].length - 1 ];
	};

	getValue( team, lobby ) {

		if ( this.size( team ) > 0 ){
			let action = this.last( team );
			this.remove( team );
			return action;
		} else {
			return	{ player: {
							team: team,
							lobby: lobby,
							state: "wait"
						}
					};
		};

	};	

	size( team ) {
		return this[team].length;
	};

};


class gameClient {

	constructor() {

		this.queue = new Queue();

	};

	update( data ) {

		console.log( "client update w/ data " + data.state );
	
	};

};

//let gameclient = new gameClient();
//let urlParams = new URLSearchParams( window.location.search );
//let id = urlParams.get( 'id' );

// https://stackoverflow.com/questions/50219787/call-static-javascript-function-in-class-when-its-name-is-a-string
// Add class to object to access static method with a variable name: that_object[varClassName]
const objectifyClass = {

	//Attacking,
	//ChaseBall,
	//Defending,
	//Dribble,
	//InterceptBall,
	//KickBall,
	//ReceiveBall,
	//ReturnToHomeRegion,
	//SupportAttacker,
	//Wait

};
*/
