class GameClient extends VirtualJoystick {

	constructor() {

		super( { container: document.getElementById( "joystickStatic" ),
					maxTravel: 32,
					style: "virtualJoystic-stick"
				});

		this.canvas = document.getElementById( 'canvas' );
		this.context = this.canvas.getContext( '2d' );

		this.w = 1000;
		this.h = 600;
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		this.canvas.style.zIndex = "10";

		this.playerNum = 22;
		this.players = new Array();

		let options = {
			mass: 1,
			maxSpeed: 5,
			maxForce: 1,
			edgeBehavior: 'bounce',
			maxDistance: 400,
			minDistance: 20,
			radius: 8
		};

	};

	loop() {

		RAF = requestAnimationFrame( this.loop.bind( this ) );

		let now = Date.now();
		let delta = ( now - this.previousTick ) / 30; // adjust here to have a good looking speed
		this.previousTick = now;

		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

		for( let t = 0; t < this.players.length; t++ ) {

			let player = this.players[t];
			player.state.update( delta );
			let playerColor = player.color;

			if ( player.state.getCurrentState() == "controlled" ) {
				this.moveControlledPlayer ( t ); 
			 	playerColor = "#ffffff";

			};

			this.context.beginPath();
			this.context.fillStyle = playerColor;
			this.context.arc( player.boid.position.x, player.boid.position.y, player.radius, Math.PI * 2, false );
			this.context.fill();

			//draw direction nose 
			let angle = Math.atan2( player.boid.velocity.y, player.boid.velocity.x );
			let x = player.boid.position.x + player.radius * Math.cos( angle );
			let y = player.boid.position.y + player.radius * Math.sin( angle );

			this.context.fillStyle = '#f00';
			this.context.beginPath();
			this.context.arc( x, y, 3, 0, 2 * Math.PI, false );
			this.context.fill();

		};

	};

	reset() {

		this.players.length = 0;
		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		cancelAnimationFrame( RAF );

	};

	init( lobby, team, schemaRedTeam, schemaBlueTeam ) {

		this.team = team;
		this.lobby = lobby;

		for( let i = 0; i < this.playerNum; i++ ) {

			this.players.push( new Object() );

			this.players[i].index = i;
			this.players[i].lobby = this.lobby;
			this.players[i].boid = new Boid();
			this.players[i].boid.destination = new Vec2();
			this.players[i].radius = 8;
			this.players[i].AI = true;
			this.players[i].state = new State( this.players[i], this.team );

			if ( i < 11 ){
				this.players[i].team = "redTeam";
			} else {
				this.players[i].team = "blueTeam";
			};

			this.players[i].state.pushState( "wait" );

		};

		//this.formation( schemaRedTeam, schemaBlueTeam )
		this.loop();
		this.initButton();

	};

	updatePlayer( obj ) {

		this.players[ obj.player.index ].boid.destination.x = obj.player.destination.x;
		this.players[ obj.player.index ].boid.destination.y = obj.player.destination.y;
		this.players[ obj.player.index ].boid.velocity.x = obj.player.velocity.x; 
		this.players[ obj.player.index ].boid.velocity.y = obj.player.velocity.y;
		this.players[ obj.player.index ].boid.rotate = obj.player.rotate;
		
		// highlight player mouse buttun
		if ( this.players[ obj.player.index ].color != "#ffffff" ){
			this.players[ obj.player.index ].color = obj.player.color;
		};

		// highlight player controlled
		if ( this.players[ obj.player.index ].state.getCurrentState() == "controlled" ){
			this.players[ obj.player.index ].color = "#ffffff";
		};

		this.players[ obj.player.index ].team = obj.player.team;
		this.players[ obj.player.index ].state.popState();
		this.players[ obj.player.index ].state.pushState( obj.player.state );

	};

	updateControlledPlayer( obj ) {

		this.players[ obj.player.index ].boid.position.x = obj.player.position.x;
		this.players[ obj.player.index ].boid.position.y = obj.player.position.y;
		this.players[ obj.player.index ].boid.velocity.x = obj.player.velocity.x;
		this.players[ obj.player.index ].boid.velocity.y = obj.player.velocity.y;		
		this.players[ obj.player.index ].state.popState();
		this.players[ obj.player.index ].state.pushState( obj.player.state );

	};

	moveControlledPlayer( controlledIndex ){

		let player = this.players[ controlledIndex ];

		let angle = this.getAngle();

		if ( angle != 0 ){

			player.boid.velocity.x = Math.cos( angle );
			player.boid.velocity.y = Math.sin( angle ) * -1;//invert direction

			player.boid.position.x += player.boid.velocity.x;
			player.boid.position.y += player.boid.velocity.y;
		
			if ( socket.readyState == socket.OPEN ){
			
				socket.send( JSON.stringify( {		
					player: {
						index: player.index,
						position: {
							x: player.boid.position.x,
							y: player.boid.position.y
						},
						velocity: {
							x: player.boid.velocity.x,
							y: player.boid.velocity.y
						},					
						lobby: player.lobby,
						team: player.team,
						state: "controlled"
					}

				}));

			};

		};

	};

	initButton(){

		Array.from( document.getElementsByClassName( "inside" ) ).forEach( function( element, index ) {

			element.style.cursor = "default";
			if ( element.classList.contains( this.team ) ) element.style.cursor = "pointer"; 

			if ( element.classList.contains( "green" ) ){
				element.classList.remove( "green" );
			};

			if ( element.classList.contains( "orange" ) ){
				element.classList.remove( "orange" );
			};

				
		}.bind( this ) );

	};


};
