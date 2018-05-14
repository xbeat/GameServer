const SoccerPitch = require( '../modules/SoccerPitch.js' );

class GameServer {

	constructor( timer, redTeam = 0, blueTeam = 0, lobby = 0 ){

		this.redTeam = redTeam; 
		this.blueTeam = blueTeam;
		this.lobby = lobby;
		this.timer = timer;

		/**
		Length of a tick in milliseconds. The denominator is your desired framerate.
		e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
		*/
		this.tickLengthMs = 1000 / 60;

		/* gameLoop related variables */
		// timestamp of each loop
		this.previousTick = Date.now();
		
		// number of times gameLoop gets called
		this.then = Date.now();

		let cxClient = 460;//600
		let cyClient = 290;//380

		this.g_SoccerPitch = new SoccerPitch( cxClient, cyClient );
		this.active = true;

		this.loop();

	};

	loop(){
	
		let now = Date.now();

		if ( this.previousTick + this.tickLengthMs <= now ) {
			let delta = ( now - this.previousTick ) / 30;
			this.previousTick = now;

		    //update
		    if ( this.timer.ReadyForNextFrame() && this.active ) {
		    	
			        this.g_SoccerPitch.Update();
			        this.g_SoccerPitch.Render();

		    };
			
		};

		if ( Date.now() - this.previousTick < this.tickLengthMs - 16 ) {
			if ( this.active ) setTimeout( this.loop.bind( this ) ); 
		
		} else {
		
			if ( this.active ) setImmediate( this.loop.bind( this ) );
		};

	};

};

module.exports = GameServer;