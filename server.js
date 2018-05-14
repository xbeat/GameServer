'user strict';
const express = require( 'express' );

const WebSocket = require( 'ws' );
const http = require( 'http' );
const uuidv4 = require( 'uuid/v4' );
const url = require( 'url' );

const PrecisionTimer = require( './modules/PrecisionTimer.js' );

let timer = new PrecisionTimer();
timer.Start();

const GameServer = require( './modules/GameServer.js' );

const app = express();
const webServer = http.createServer( app );
app.use( express.static( __dirname + '/' ) );

app.get( '/', function( req, res ){

	res.sendFile( __dirname + "/start.html" );
	
});

class Server {

	constructor(){

		this.gameServer;

		this.emitter = require( './emitter.js' );

		this.wss = new WebSocket.Server( { server: webServer } );

		this.wss.on( 'connection', function connection( ws, req ) {

			this.onConnection( ws );

			ws.on( 'message', function message( data ) {

				this.onMessage( data, ws );
				
			}.bind( this ) );

		}.bind( this ) );

	};

	onConnection( ws ) {
		
		this.lobby = uuidv4();
		this.emitter.init( ws );

		if ( !this.gameServer ) { 
		
			this.gameServer = new GameServer( timer );

		};

	};

	onMessage( data, ws ) {

		let JSONdata = JSON.parse( data )

		if( "state" in JSONdata ) {

			switch( JSONdata.state ) {
				
				case "reset":
					this.gameServer == null;					
					break;

			};

		};

	};

};

let server = new Server();
const PORT = process.env.PORT || 4000;

webServer.listen( PORT, function listening() {
	console.log( 'Listening on %d', webServer.address().port );
});