'user strict';
const express = require( 'express' );
const cookieParser = require('cookie-parser')

const WebSocket = require( 'ws' );
const http = require( 'http' );
const uuidv4 = require( 'uuid/v4' );
const url = require( 'url' );

const GameServer = require( './modules/GameServer.js' );
let Positioning = require( './modules/Positioning.js' );

const app = express();
const webServer = http.createServer( app );
app.use( express.static( __dirname + '/' ) );
app.use( cookieParser() );

app.get( '/', function( req, res ){

	res.sendFile( __dirname + "/index.html" );
	
	// Cookies that have not been signed
	//console.log( 'Cookies: ', req.cookies );

	// Cookies that have been signed
	//console.log( 'Signed Cookies: ', req.signedCookies );

});

class Server extends Positioning{

	constructor(){

		super();

		this.User = require( './modules/User.js' );
		this.wss = new WebSocket.Server( { server: webServer } );

		this.allConnectedUsers = new Map();
		this.gameServer = new Map();
		this.webSockets = new Object();
		this.positioning = new Positioning();

		this.wss.on( 'connection', function connection( ws, req ) {

			ws.id = uuidv4();
			ws.isAlive = true;

			// action on connection
			this.onConnection( ws );

			// action on messae
			ws.on( 'message', function incoming( data ) {

				this.onMessage( JSON.parse( data ), ws );

			}.bind( this ) );

			//close connection
			ws.on( 'close', function () {

				delete this.webSockets[ ws.id ];
				this.allConnectedUsers.delete( ws.id );

				//if game was started reset opponent and remove broken game
				if ( ws.opponent != undefined ){
					
					let tmpOpponent = this.allConnectedUsers.get( ws.opponent ); 
					tmpOpponent.changeState( "idle" );
					tmpOpponent.removeLobby( ws.lobby );
					this.allConnectedUsers.set( ws.opponent, tmpOpponent ); 
					this.gameServer.delete( ws.lobby );
					this.webSockets[ ws.opponent ].opponent = undefined;
					this.webSockets[ ws.opponent ].lobby = undefined;

					if ( this.webSockets[ ws.opponent ].readyState == this.webSockets[ ws.opponent ].OPEN ){

						this.webSockets[ ws.opponent ].send( JSON.stringify( {		
									state: "reset",
									websocket: ws.id 
								}));
					
					};

				};

				console.log( 'deleted: ' + ws.id );

			}.bind( this ) );

			//terminate broken connection
			ws.on( 'pong', function() {
				this.isAlive = true;
			});

			const interval = setInterval( function ping() {
				
				this.wss.clients.forEach( function each( ws ) {
					if ( ws.isAlive === false ) return ws.terminate();

					ws.isAlive = false;
					ws.ping( function() {} );
				});

			}.bind( this ), 60000 );
		
		}.bind( this ) );

	};


	onConnection( ws ) {
		
		let connectedUser = new this.User( ws.id );
		this.allConnectedUsers.set( ws.id, connectedUser );

		this.webSockets[ ws.id ] = ws;
		this.webSockets[ ws.id ].send( JSON.stringify( {		
							state: "connected",
							websocket: ws.id 
						}));

		//find opponent
		for ( let user of this.allConnectedUsers.values() ) {

			if ( connectedUser.id != user.id && user.state == "idle" && this.webSockets[ user.id ].readyState === WebSocket.OPEN && this.webSockets[ connectedUser.id ].readyState === WebSocket.OPEN ){

				user.changeState( "busy" );
				connectedUser.changeState( "busy" );

				let lobby = uuidv4();

				this.webSockets[ user.id ].lobby = lobby;
				this.webSockets[ user.id ].opponent = connectedUser.id;

				this.webSockets[ connectedUser.id ].lobby = lobby;
				this.webSockets[ connectedUser.id ].opponent = user.id;
				
				function getRandomInt( min, max ){
					return Math.random() * ( max - min ) + min;
				};

				this.schemaRedTeam = parseInt( getRandomInt( 0, 16 ) );
				this.schemaBlueTeam = parseInt( getRandomInt( 0, 16 ) );

				this.webSockets[ user.id ].send( JSON.stringify( {		
							team: "redTeam",
							state: "start",
							lobby: lobby,
							schemaRedTeam: this.schemaRedTeam,
							schemaBlueTeam: this.schemaBlueTeam
						}));

				this.webSockets[ connectedUser.id ].send( JSON.stringify( {		
							team: "blueTeam",
							state: "start",
							lobby: lobby,
							schemaRedTeam: this.schemaRedTeam,
							schemaBlueTeam: this.schemaBlueTeam
						}));

				this.gameServer.set( lobby, new GameServer( this.webSockets[user.id], this.webSockets[connectedUser.id], lobby ) );

				console.log( "started" );

				break;

			};

		};

	};

	broadcast( ws ) {

		// Broadcast to everyone else.
		this.wss.clients.forEach( function each( client ) {
			if ( client !== this.ws && client.readyState === WebSocket.OPEN ) {
				client.send( this.data );
			};
		}.bind( this ) );
		
		/* broadcast to all
		wss.broadcast = function broadcast( data ) {
			wss.clients.forEach(function each( client ) {
				if ( client.readyState === WebSocket.OPEN ) {
					client.send( data );
				};
			});
		};
		wss.broadcast( JSON.stringify( { data: "data" } ) );
		*/

		this.formation.updateFormation( this.data );

	};

	onMessage( obj, ws ) {

		function getRandomInt( min, max ){

			return Math.random() * ( max - min ) + min;
		};		

		let gs = this.gameServer.get( obj.player.lobby );
		if ( gs == undefined ) return false;
		
		if ( obj.player.state == "getQueueData" ){
			ws.send( gs.players[ obj.player.index ].state.queue.getValue( obj.player.team ) );
		};

		if ( obj.player.state == "controlled" ){

			gs.players[ obj.player.index ].state.popState();
			gs.players[ obj.player.index ].state.pushState( obj.player.state );

			if ( this.webSockets[ ws.opponent ].readyState == this.webSockets[ ws.opponent ].OPEN ){

				this.webSockets[ ws.opponent ].send( JSON.stringify( {		
							player: {
								index: obj.player.index,
								position: { 
									x: obj.player.position.x,
									y: obj.player.position.y
								},
								velocity: { 
									x: obj.player.velocity.x,
									y: obj.player.velocity.y
								},								
								state: "controlled",
							},
							state: "controlled",
						}));
			};

		};

		if ( obj.player.state == "dropControl" ){

			gs.players[ obj.player.index ].boid.velocity.x = obj.player.velocity.x;
			gs.players[ obj.player.index ].boid.velocity.y = obj.player.velocity.y;

			gs.players[ obj.player.index ].state.popState();
			gs.players[ obj.player.index ].state.pushState( "setArrive" );

			if ( this.webSockets[ ws.opponent ].readyState == this.webSockets[ ws.opponent ].OPEN ){

				this.webSockets[ ws.opponent ].send( JSON.stringify( {		
							player: {
								index: obj.player.index,
								position: { 
									x: obj.player.position.x,
									y: obj.player.position.y
								},
								velocity: { 
									x: obj.player.velocity.x,
									y: obj.player.velocity.y
								},								
								state: "wait",
							},
							state: "dropControl",
						}));
			};			
		
		};

		/**
		* Set all player Random position.
		* 
		*/
		if ( obj.player.state == "goRandom" ){

			for ( var i = 0; i < gs.playerNum; i++ ){

				gs.players[ i ].boid.destination.x = getRandomInt( 60, 960 );
				gs.players[ i ].boid.destination.y = getRandomInt( 40, 580 );
				gs.players[ i ].state.popState();
				gs.players[ i ].state.pushState( "addQueue" );			

			};
		
		};
		
		/**
		* Set all player Home position.
		* 
		*/		
		if ( obj.player.state == "goHome" ){

			for ( let i = 0; i < gs.playerNum; i++ ){

				let distribute = function( val, max, min ) { return ( val - min ) / ( max - min ); }; //normalize
				let value = distribute( i, gs.playerNum, 0 ) * 18;
				let row = parseInt( value / 6 );
				let column = value % 6;      
				gs.players[ i ].boid.destination.x = column * 150 + getRandomInt( 60,90 ); 
				gs.players[ i ].boid.destination.y = row * 187.5 + getRandomInt( 90, 120 );
				gs.players[ i ].state.popState();
				gs.players[ i ].state.pushState( "addQueue" );

			};		

		};

		/**
		* Set all player formation position.
		* 
		*/
		if ( obj.player.state == "goFormation" ){

			let formation = [
				[ 5, 4, 1 ],
				[ 4, 5, 1 ],
				[ 4, 4, 2 ],
				[ 4, 4, 1, 1 ],
				[ 4, 3, 3 ],
				[ 4, 3, 2 ],
				[ 4, 2, 3, 1 ],
				[ 4, 2, 2, 2 ],
				[ 4, 2, 1, 3 ],
				[ 4, 2, 4, 1 ],
				[ 4, 1, 3, 2 ],
				[ 4, 1, 2, 3 ],
				[ 3, 5, 2, 2 ],
				[ 3, 5, 1, 1 ],
				[ 3, 4, 1, 2 ],
				[ 3, 4, 3 ],
				[ 3, 4, 2, 1 ]
			];

			let index = 1;
			let width = 1000;
			let height = 600;
			let	stepX = 0;
			let stepY = 0;

			let pointerFormation = this.schemaRedTeam;

			for ( let c = 0; c < formation[ pointerFormation ].length; c++ ) {
				stepX += ( width / 2 ) / formation[ pointerFormation ].length;
				for ( let i = 0; i < formation[ pointerFormation ][ c ]; i++ ){
					let step = height / formation[ pointerFormation ][ c ]; 
					stepY = step * ( i + 1 ) - step / 2;
					gs.players[ index ].boid.destination.x = stepX - 50;
					gs.players[ index ].boid.destination.y = stepY;
					gs.players[ index ].state.popState();
					gs.players[ index ].state.pushState( "wait" );
					index++;
				};
				stepY = 0;
			};

			pointerFormation = this.schemaBlueTeam;

			for ( let c = 0; c < formation[ pointerFormation ].length; c++ ) {
				stepX += ( width / 2 ) / formation[ pointerFormation ].length;
				for ( let i = 0; i < formation[ pointerFormation ][ c ]; i++ ){
					var step = height / formation[ pointerFormation ][ c ]; 
					stepY = step * ( i + 1 ) - step / 2;
					gs.players[ index ].boid.destination.x = stepX - 115;
					gs.players[ index ].boid.destination.y = stepY;
					gs.players[ index ].state.popState();
					gs.players[ index ].state.pushState( "wait" );					
					index++;
				};
				stepY = 0;
			};

			//goalkeeper
			gs.players[ 0 ].boid.destination.x = 30;
			gs.players[ 0 ].boid.destination.y = 300;
			gs.players[ 0 ].state.popState();
			gs.players[ 0 ].state.pushState( "wait" );

			gs.players[ 21 ].boid.destination.x = 950;
			gs.players[ 21 ].boid.destination.y = 300;
			gs.players[ 21 ].state.popState();
			gs.players[ 21 ].state.pushState( "wait" );	

			for ( let i = 0; i < gs.playerNum; i++ ){

				gs.players[ i ].state.popState();
				gs.players[ i ].state.pushState( "addQueue" );

			};	

		};

	};

};

let server = new Server();
const PORT = process.env.PORT || 4000;

webServer.listen( PORT, function listening() {
	console.log( 'Listening on %d', webServer.address().port );
});

