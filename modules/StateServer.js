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

	getValue( team ) {

		if ( this.size( team ) > 0 ){
			let action = this.last( team );
			this.remove( team );
			return action;
		} else {
			return JSON.stringify( { state: "wait" });
		};

	};	

	size( team ) {
		return this[team].length;
	};

};

class State {

	constructor( player ) {
		this.queue = new Queue();
		this.stack = new Array();
		this.action = new Action( this, player );
	};

	update( delta ){
		let currentStateFunction = this.getCurrentState();
		if ( currentStateFunction != null ) {
			this.action[ currentStateFunction ]( delta );
		};
	};

	popState() {
		return this.stack.pop();
	};

	pushState( state ) {
		if ( this.getCurrentState() != state ) {
			this.stack.push( state );
		};
		return this;
	};

	getCurrentState() {
		return this.stack.length > 0 ? this.stack[ this.stack.length - 1 ] : null;
	};

};

module.exports = State;

class Action {
  
	constructor ( state, player ) {

		this.state = state;
		this.player = player;
		this.actions = {
			setArrive:	  "setArrive",
			arrive:		  "arrive",
			setRotate:	  "setRotate",
			rotate:		  "rotate",
			wait:		  "wait",
			controlled:	  "controlled",
			dropControl:  "dropControl",
			addQueue:  	  "addQueue"
		};

		this.width = 1000;
		this.height = 600;
	
	};

	/**
	* wait 
	*
	*/
	wait(){
		return true;
	};

	/**
	* wait 
	*
	*/
	controlled(){
		return true;
	};

	/**
	* wait 
	*
	*/
	dropControl(){
		this.state.popState();
		this.state.pushState( this.actions.setArrive );
		return true;
	};

	/**
	* Arrive
	*
	*/
	arrive( delta ) {

		this.player.boid.arrive( this.player.boid.destination ).update( delta );
		var dx = this.player.boid.destination.x - this.player.boid.position.x;
		var dy = this.player.boid.destination.y - this.player.boid.position.y;
		var distSq = dx * dx + dy * dy;

		if ( distSq < this.player.boid.arriveThreshold ){

			this.state.popState();
			this.state.pushState( this.actions.setArrive );

		};
	};

	/**
	* setArrive
	*
	*/
	setArrive() {

		function getRandomInt( min, max ){
			return Math.random() * ( max - min ) + min;
		};

		this.player.boid.destination.x = getRandomInt( 10, this.width-10 );
		this.player.boid.destination.y = getRandomInt( 10, this.height-10 );
		const angle = Math.atan2( this.player.boid.velocity.y, this.player.boid.velocity.x );  
		const angleDest = Math.atan2( this.player.boid.destination.y - this.player.boid.position.y, this.player.boid.destination.x - this.player.boid.position.x );
		this.player.boid.rotate = { start: angle, end: angleDest, duration: getRandomInt( 1500, 2000 ) };

		this.state.popState();
		this.state.pushState( this.actions.setRotate );

		let message = JSON.stringify( {		
			player: {
				index: this.player.index,
				destination: {
					x: this.player.boid.destination.x,
					y: this.player.boid.destination.y
				},
				position: {
					x: this.player.boid.position.x,
					y: this.player.boid.position.y
				},
				velocity: {
					x: this.player.boid.velocity.x,
					y: this.player.boid.velocity.y
				},
				rotate: this.player.boid.rotate,
				team: this.player.team,
				color: this.player.color,
				state: this.player.state.getCurrentState(),
				lobby: this.player.lobby
			},
			state: "update"
		} );

		this.state.queue.add( message, "redTeam" );
		this.state.queue.add( message, "blueTeam" );

	};

	/*
	* add queue
	*/
	addQueue(){

		this.state.popState();
		this.state.pushState( this.actions.arrive );

		let message = JSON.stringify( {		
			player: {
				index: this.player.index,
				destination: {
					x: this.player.boid.destination.x,
					y: this.player.boid.destination.y
				},
				position: {
					x: this.player.boid.position.x,
					y: this.player.boid.position.y
				},
				velocity: {
					x: this.player.boid.velocity.x,
					y: this.player.boid.velocity.y
				},
				rotate: this.player.boid.rotate,
				team: this.player.team,
				color: this.player.color,
				state: this.player.state.getCurrentState(),
				lobby: this.player.lobby
			},
			state: "update"
		} );

		this.state.queue.add( message, "redTeam" );
		this.state.queue.add( message, "blueTeam" );

	};

	/**
	* The "setRotate" state.
	* It makes the player set rotate by value.
	*/
	setRotate() {

		this.start = this.player.boid.rotate.start;
		this.end = this.player.boid.rotate.end;
		this.next = null;

		// https://stackoverflow.com/questions/1878907/the-smallest-difference-between-2-angles
		this.shortest = Math.atan2( Math.sin( this.end - this.start ), Math.cos( this.end - this.start ) );    

		this.timeStart = Date.now();

		this.state.popState();
		this.state.pushState( this.actions.rotate );

	};

	/**
	* The "rotate" state.
	* It makes the player rotate by value.
	*/	
	rotate() {

		this.duration = this.player.boid.rotate.duration || 1000;

		let currentTime = Date.now();
		if ( !this.timeStart ) this.timeStart = currentTime;

		this.timeNormalized = ( currentTime - this.timeStart ) / this.duration ;

		this.step = this.shortest * this.timeNormalized;
		this.next = this.start + this.step;

		if ( this.timeNormalized < 1 ) {

			this.player.boid.velocity.x = Math.cos( this.next );
			this.player.boid.velocity.y = Math.sin( this.next );
			
		} else {

			this.player.boid.velocity.x = Math.cos( this.end );
			this.player.boid.velocity.y = Math.sin( this.end );

			this.state.popState();
			this.state.pushState( this.actions.arrive );
		};

	};

};
