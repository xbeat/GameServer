'user strict';
const express = require( 'express' );
const cookieParser = require('cookie-parser')
const WebSocket = require( 'ws' );

const http = require( 'http' );
const uuidv4 = require( 'uuid/v4' );
const url = require( 'url' );

const GameServer = require( './modules/GameServer.js' );

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

class Server {

	constructor(){

		this.wss = new WebSocket.Server( { server: webServer } );
		this.gameServer = new GameServer();

	};

};

let server = new Server();
const PORT = process.env.PORT || 4000;

webServer.listen( PORT, function listening() {
	console.log( 'Listening on %d', webServer.address().port );
});

