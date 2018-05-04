'user strict';
const express = require( 'express' );

const WebSocket = require( 'ws' );
const http = require( 'http' );
const uuidv4 = require( 'uuid/v4' );
const url = require( 'url' );

const GameServer = require( './modules/GameServer.js' );

const app = express();
const webServer = http.createServer( app );
app.use( express.static( __dirname + '/' ) );

app.get( '/', function( req, res ){

	res.sendFile( __dirname + "/index.html" );
	
	// Cookies that have not been signed
	//console.log( 'Cookies: ', req.cookies );

	// Cookies that have been signed
	//console.log( 'Signed Cookies: ', req.signedCookies );

});

class Server {

	constructor(){

		this.emitter = require( './emitter.js' );

		this.wss = new WebSocket.Server( { server: webServer } );

		this.wss.on( 'connection', function connection( ws, req ) {

			this.onConnection( ws );

			ws.on( 'message', function connection( data ) {

				this.onMessage( data, ws );
				
			}.bind( this ) );

		}.bind( this ) );

	};


	onConnection( ws ) {
		
		console.log( "Connected" );

		this.lobby = uuidv4();
		this.team = "redTeam";

		this.gameServer = new GameServer();
		this.emitter.init( ws );

		this.emitter.send( {		
					player: {
						team: this.team,
						lobby: this.lobby,
						state: "connected",
					}});

	};


	onMessage( data, ws ) {

		console.log( "Message" );
		let JSONdata = JSON.parse( data )

		if( "state" in JSONdata.player ) {

			switch( JSONdata.player.state ) {
				
				case "connected":
				case "shoot":
				case "reset":
					this.emitter.send( JSONdata );
					break;

				case "getValue":

					ws.send( JSON.stringify( { 
							player: {
								team: this.team,
								lobby: this.lobby,
								state: "receive",
								data: this.emitter.queue.getValue( JSONdata.player.team, JSONdata.player.lobby )
							}})
						);					
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