'use strict';

// ------------ Globals ------------
let RAF;

let cxClient = 460;//600
let cyClient = 290;//380

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
let skill = new Skill();	

// resize Scene 3D
window.addEventListener( 'resize', function () {
	scene3D.camera.aspect = window.innerWidth / window.innerHeight;
	scene3D.camera.updateProjectionMatrix();
	scene3D.renderer.setSize( window.innerWidth, window.innerHeight );
}, false);

//--------------- start the timer ---------------
let timer = new PrecisionTimer();
timer.Start();

//----------- Entry Point -----------
function step() {

   	RAF = requestAnimationFrame( step );

	if ( timer.ReadyForNextFrame() ) {
		g_SoccerPitch.Render();
	};

};

// start websocket
let HOST = location.origin.replace( /^http/, 'ws' );
let socket = new WebSocket( HOST + '/?serverState=state', 'echo-protocol' );

// listening for server response
socket.onmessage = function ( message ) { 
	
	let obj = JSON.parse( message.data );

	if( typeof ( obj.e ) !== "undefined" ) {

		let color = obj.C == "r" ? "red" : "blue";
		
		switch( obj.e ) {

			case "B"://Ball
				//document.getElementById( "state" ).innerText = obj.e;
				if ( ball == null ) return; // wait for 3D instantiated
				ball.m_vPosition.set( obj.P );
				break;

			case "F"://FieldPlayer
				//document.getElementById( "state" ).innerText = obj.e;
				if ( red == null || blue == null ) return; // wait for 3D instantiated
				window[ color ].m_Players[ obj.I ].m_vPosition.set( obj.P );

				window[ color ].m_Players[ obj.I ].m_vVelocity.x = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.x - window[ color ].m_Players[ obj.I ].m_lastPosition.x ); 
				window[ color ].m_Players[ obj.I ].m_vVelocity.y = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.y - window[ color ].m_Players[ obj.I ].m_lastPosition.y );
				window[ color ].m_Players[ obj.I ].m_lastPosition.set( obj.P );
				
				window[ color ].m_Players[ obj.I ].m_vHeading.set( obj.H );
				window[ color ].m_Players[ obj.I ].m_vSide = window[ color ].m_Players[ obj.I ].m_vHeading.Perp();
				break;

			case "G"://GoalKeeper
				if ( red == null || blue == null ) return; // wait for 3D instantiated
				//document.getElementById( "state" ).innerText = obj.e;
				window[ color ].m_Players[ obj.I ].m_vPosition.set( obj.P );

				window[ color ].m_Players[ obj.I ].m_vVelocity.x = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.x - window[ color ].m_Players[ obj.I ].m_lastPosition.x ); 
				window[ color ].m_Players[ obj.I ].m_vVelocity.y = Math.abs( window[ color ].m_Players[ obj.I ].m_vPosition.y - window[ color ].m_Players[ obj.I ].m_lastPosition.y );
				window[ color ].m_Players[ obj.I ].m_lastPosition.set( obj.P );

				window[ color ].m_Players[ obj.I ].m_vLookAt.set( obj.L );
				break;

			case "P"://Parameters
				//document.getElementById( "state" ).innerText = obj.e;
				skill.setData( obj.V );
				break;				
		
		};

	};

};

// listening for any socket error
socket.onerror = function ( error ) { 

	console.log( 'WebSocket error: ' + error );

};