const Vec2 = require( '../modules/Vec2.js' );
const Boid = require( '../modules/Boid.js' );
const State = require( '../modules/StateServer.js' );

class GameServer {

	constructor( redTeam, blueTeam, lobby ){

		this.redTeam = redTeam; 
		this.blueTeam = blueTeam;

		this.width = 1000;
		this.height = 600;

		this.playerNum = 22;
		this.players = new Array();

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

		let options = {
			mass: 1,
			maxSpeed: 5,
			maxForce: 1,
			edgeBehavior: 'bounce',
			maxDistance: 400,
			minDistance: 20,
			radius: 8
		};

		this.then = Date.now();

		this.goalPosTop = 262.5;
		this.goalHeight = 80;
		this.boardRight = 950;
		this.boardleft = 50;
		this.teams = {};
		this.teams.homeScore = 0;
		this.teams.awayScore = 0;

		this.init( redTeam, blueTeam, lobby );

	};

	loop(){
	
		let now = Date.now();

		this.actualTicks++;

		if ( this.previousTick + this.tickLengthMs <= now ) {
			let delta = ( now - this.previousTick ) / 30;
			this.previousTick = now;

			for( let t = 0; t < this.players.length; t++ ) {

				this.players[t].state.update( delta, this.redTeam, this.blueTeam );

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

	init( wsRedTeam, wsBlueTeam, lobby ) {

		function getRandomInt( min, max ){
			return Math.random() * ( max - min ) + min;
		};

		for( let i = 0; i < this.playerNum; i++ ) {

			this.players.push( new Object() );

			this.players[i].boid = new Boid();
			this.players[i].boid.destination = new Vec2();
			this.players[i].radius = 8;
			this.players[i].index = i;
			this.players[i].lobby = lobby;
			this.players[i].state = new State( this.players[i] );
			this.players[i].boid.destination.x = getRandomInt( 10, this.width-10 );
			this.players[i].boid.destination.y = getRandomInt( 10, this.height-10 );

			const angle = Math.atan2( this.players[i].boid.velocity.y, this.players[i].boid.velocity.x );  
			const angleDest = Math.atan2( this.players[i].boid.destination.y - this.players[i].boid.position.y, this.players[i].boid.destination.x - this.players[i].boid.position.x );
			this.players[i].boid.rotate = { start: angle, end: angleDest, duration: getRandomInt( 1500, 2000 ) };

			this.players[i].boid.position.x = getRandomInt( 10, this.width-10 );
			this.players[i].boid.position.y = getRandomInt( 10, this.height-10 );
			this.players[i].boid.velocity.x = getRandomInt( -5, 5 ); 
			this.players[i].boid.velocity.y = getRandomInt( -5, 5 );
			this.players[i].state.pushState( "setRotate" );

			if ( i < 11 ){
				this.players[i].color = "#ff0000";
				this.players[i].team = "redTeam";
			} else {
				this.players[i].color = "#0000ff";
				this.players[i].team = "blueTeam";
			};

			let message = JSON.stringify( {		
				player: {
					index: this.players[i].index,
					destination: {
						x: this.players[i].boid.destination.x,
						y: this.players[i].boid.destination.y
					},
					position: {
						x: this.players[i].boid.position.x,
						y: this.players[i].boid.position.y
					},
					velocity: {
						x: this.players[i].boid.velocity.x,
						y: this.players[i].boid.velocity.y
					},
					rotate: this.players[i].boid.rotate,
					team: this.players[i].team,
					color: this.players[i].color,
					state: this.players[i].state.getCurrentState(),
					lobby: this.players[i].lobby
				},
				state: "update"
			} );

			//send info to other team
			wsRedTeam.send( message );
			wsBlueTeam.send( message );
				
		};

		console.log( "init game" );

		this.loop();

	};

};

module.exports = GameServer;