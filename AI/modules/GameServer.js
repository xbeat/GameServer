const SoccerPitch = require( '../modules/SoccerPitch.js' );
const PrecisionTimer = require( '../modules/PrecisionTimer.js' );

class GameServer {

	constructor( redTeam = 0, blueTeam = 0, lobby = 0 ){

		this.redTeam = redTeam; 
		this.blueTeam = blueTeam;
		this.lobby = lobby;

		/**
		Length of a tick in milliseconds. The denominator is your desired framerate.
		e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
		*/
		this.tickLengthMs = 1000 / 60;

		/* gameLoop related variables */
		// timestamp of each loop
		this.previousTick = Date.now();
		
		// number of times gameLoop gets called
		this.actualTicks = 0;
		this.then = Date.now();

		let cxClient = 460;//600
		let cyClient = 290;//380

		this.g_SoccerPitch = new SoccerPitch( cxClient, cyClient );
		this.timer = new PrecisionTimer();
		this.timer.Start();

		this.init();

	};

	init(){

		this.loop();
	
	};

	loop(){
	
		let now = Date.now();

		this.actualTicks++;

		if ( this.previousTick + this.tickLengthMs <= now ) {
			let delta = ( now - this.previousTick ) / 30;
			this.previousTick = now;

		    //update
		    if ( this.timer.ReadyForNextFrame() ) {
		    	
			        this.g_SoccerPitch.Update();
			        this.g_SoccerPitch.Render();

		    };
			
			//console.log( 'delta', delta, '(target: ' + this.tickLengthMs +' ms)', 'node ticks', this.actualTicks );
			this.actualTicks = 0;

		};

		if ( Date.now() - this.previousTick < this.tickLengthMs - 16 ) {

			setTimeout( this.loop.bind( this ) ); 
		
		} else {
		
			setImmediate( this.loop.bind( this ) );
		};

	};

};

module.exports = GameServer;