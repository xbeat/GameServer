
'use strict';

// ------------ Globals ------------
let RAF_AI;
//let RAF;
let EXECUTERAF = true;

let cxClient = 460;//600
let cyClient = 290;//380
let scene3D = null;
//let heatMap = null;

let Color = {
	WHITE: "255, 255, 255",
	BLACK: "0, 0, 0"
};

let canvas = document.createElement( "canvas" );
document.body.appendChild( canvas );
//canvas.style.position = "absolute";
//canvas.style.top = "20px";
//canvas.style.left = "20px";
//canvas.style.zIndex = "-97";

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

//gdi.fillRect( Color.WHITE, 0, 0, canvas.width, canvas.height );

let g_SoccerPitch = new SoccerPitch( cxClient, cyClient );

//g_SoccerPitch.Render();

gdi.StopDrawing( context );

//--------------- update ---------------
let timer = new PrecisionTimer();
//start the timer
timer.Start();

//----------- Entry Point -----------
document.addEventListener( "DOMContentLoaded", function( event ) {
	
	//----------------- start engine ---------------

    window.addEventListener( "load", function(){

		( function step() {
	   		RAF_AI = requestAnimationFrame( step );

		    //update
		    if ( timer.ReadyForNextFrame() ) {
		    	
		    	if ( EXECUTERAF === true ){
			        g_SoccerPitch.Update();
			        //render
			        g_SoccerPitch.Render();
			        //panel.revalidate();
			        //panel.repaint();

		    	};
		    };
			
		}());

	});

});
