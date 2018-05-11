
'use strict';

// ------------ Globals ------------
let RAF_AI;

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

//---------------- init -----------------
gdi.StartDrawing( context );
let g_SoccerPitch = new SoccerPitch( cxClient, cyClient );

var ball = g_SoccerPitch.m_pBall;
var red = g_SoccerPitch.m_pRedTeam;
var blue = g_SoccerPitch.m_pBlueTeam;

//--------------- update ---------------
let timer = new PrecisionTimer();
//start the timer
timer.Start();

//----------- Entry Point -----------
document.addEventListener( "DOMContentLoaded", function( event ) {
	
    window.addEventListener( "load", function(){

		( function step() {

	   		RAF_AI = requestAnimationFrame( step );

		    //update
		    if ( timer.ReadyForNextFrame() ) {
		    	
		    	if ( EXECUTERAF === true ){

			        g_SoccerPitch.Render();

		    	};

		    };
			
		}());

	});

});

// ------------ queue class ---------
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

// websocket
let gameclient = new gameClient();
let urlParams = new URLSearchParams( window.location.search );
let id = urlParams.get( 'id' );
var obj = null;

let HOST = location.origin.replace( /^http/, 'ws' );

// connecting to the web server
let socket = new WebSocket( HOST + '/?serverState=state', 'echo-protocol' );
//var socket = new WebSocket( 'ws://localhost:4000/' + id, 'echo-protocol' ); 

// https://stackoverflow.com/questions/50219787/call-static-javascript-function-in-class-when-its-name-is-a-string
// Add class to object to access static method with a variable name: that_object[testVar]
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

// listening for server response
socket.onmessage = function ( message ) { 

	obj = JSON.parse( message.data );

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
				document.getElementById( "state" ).innerText = obj.e;
				ball.m_vPosition.set( obj.P );
				break;

			case "F"://FieldPlayer
				document.getElementById( "state" ).innerText = obj.e;
				window[ color ].m_Players[ obj.I ].m_vPosition.set( obj.P );
				window[ color ].m_Players[ obj.I ].m_vHeading.set( obj.H );
				window[ color ].m_Players[ obj.I ].m_vSide = window[ color ].m_Players[ obj.I ].m_vHeading.Perp();
				break;

			case "G"://GoalKeeper
				document.getElementById( "state" ).innerText = obj.e;
				window[ color ].m_Players[ obj.I ].m_vPosition.set( obj.P );
				window[ color ].m_Players[ obj.I ].m_vLookAt.set( obj.L );
				break;
		
		};

	};

};

// listening for any socket error
socket.onerror = function ( error ) { 

	console.log( 'WebSocket error: ' + error );

};