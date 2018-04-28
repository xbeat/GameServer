class State {

	constructor( player, team ) {

		this.stack = new Array();
		this.player = player;
		this.team = team;
		this.action = new Action( this );

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

			document.getElementById( this.player.index ).innerText = state;
			this.stack.push( state );
		
		};
		return this;
	
	};

	getCurrentState() {
	
		return this.stack.length > 0 ? this.stack[ this.stack.length - 1 ] : null;
	
	};

};

class Action {
  
	constructor ( state ) {

		this.state = state;
		this.actions = {
			setArrive: 	 "setArrive",
			arrive:		 "arrive",
			setRotate:	 "setRotate",
			rotate:		 "rotate",
			wait:		 "wait",
			getControl:	 "getControl",
			dropControl: "dropControl",
			controlled:	 "controlled",
		};

		this.width = 1000;
		this.height = 600;
	
	};

	/*
	* controlled
	*
	*/
	getControl(){
		
		//send info to server
		if ( socket.readyState === WebSocket.OPEN ) { 

			socket.send( JSON.stringify( {		
				player: {
					index: this.state.player.index,
					position: {
						x: this.state.player.boid.position.x,
						y: this.state.player.boid.position.y
					},
					velocity: {
						x: this.state.player.boid.velocity.x,
						y: this.state.player.boid.velocity.y
					},					
					lobby: this.state.player.lobby,
					team: this.state.team,
					state: "controlled"
				}

			}));
		
		};

		this.state.popState();
		this.state.pushState( this.actions.controlled );
		return true;

	};

	/*
	* controlled
	*
	*/
	dropControl(){

		//send info to server
		if ( socket.readyState === WebSocket.OPEN ) {

			socket.send( JSON.stringify( {		
				player: {
					index: this.state.player.index,
					position: {
						x: this.state.player.boid.position.x,
						y: this.state.player.boid.position.y
					},
					velocity: {
						x: this.state.player.boid.velocity.x,
						y: this.state.player.boid.velocity.y
					},					
					lobby: this.state.player.lobby,
					team: this.state.team,
					state: "dropControl"
				}

			}));
		
		};

		document.getElementById( this.state.player.index ).classList.remove( "green" );

		this.state.popState();
		this.state.pushState( this.actions.wait );		
		return true;

	};

	/*
	* controlled
	*
	*/
	controlled(){

		document.getElementById( this.state.player.index ).classList.add( "green" );
		return true;

	};

	/**
	* wait 
	*
	*/
	wait(){

		//send info to server
		if ( socket.readyState === WebSocket.OPEN ) { 

			socket.send( JSON.stringify( {		
				player: {
					index: this.state.player.index,
					lobby: this.state.player.lobby,
					team: this.state.team,
					state: "getQueueData"
				}

			}));
		
		};

		return true;

	};

	/**
	* setArrive
	*
	*/
	setArrive(){

		this.state.popState();
		this.state.pushState( this.actions.arrive );

	};

	/**
	* Arrive
	*
	*/
	arrive( delta ){

		this.state.player.boid.arrive( this.state.player.boid.destination ).update( delta );
		var dx = this.state.player.boid.destination.x - this.state.player.boid.position.x;
		var dy = this.state.player.boid.destination.y - this.state.player.boid.position.y;
		var distSq = dx * dx + dy * dy;

		if ( distSq < this.state.player.boid.arriveThreshold ){

			this.state.popState();
			this.state.pushState( this.actions.wait );

		};
	};

	/**
	* The "setRotate" state.
	* It makes the player set rotate by value.
	*/
	setRotate() {

		this.duration = this.state.player.boid.rotate.duration || 1000;
		this.start = this.state.player.boid.rotate.start;
		this.end = this.state.player.boid.rotate.end;
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

		let currentTime = Date.now();
		if ( !this.timeStart ) this.timeStart = currentTime;

		this.timeNormalized = ( currentTime - this.timeStart ) / this.duration ;

		this.step = this.shortest * this.timeNormalized;
		this.next = this.start + this.step;

		if ( this.timeNormalized < 1 ) {

			this.state.player.boid.velocity.x = Math.cos( this.next );
			this.state.player.boid.velocity.y = Math.sin( this.next );
			
		} else {

			this.state.player.boid.velocity.x = Math.cos( this.end );
			this.state.player.boid.velocity.y = Math.sin( this.end );

			this.state.popState();
			this.state.pushState( this.actions.arrive );

		};

	};

};
