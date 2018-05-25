'user strict';
const express = require( 'express' );
const pg = require( 'pg' );
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

class Database {

	constructor(){

		this.pool = new pg.Pool( {
			user: 'giuseppecanale',
			host: '127.0.0.1',
			database: 'giuseppecanale',
			password: '',
			idleTimeoutMillis: 30000,
			port: '5432' } );		

	};

	select( id, emitter ){

		this.pool.query( 'SELECT * FROM parameters WHERE id = $1', [id], function( err, res ) {

			if( err ) {
				return console.error( 'error running SELECT ', err );
			};

			return emitter.Parameters( res.rows[0] );

		});

	};

	insert(){

		this.pool.query( 'INSERT INTO parameters(username, password) VALUES($1, $2) returning id', [req.body.username, req.body.password], function( err, res ) {

			if( err ) {
				return console.error( 'error running INSERT', err );
			};

		});

	};

	update( skillId, value ){

		this.pool.query( `UPDATE parameters SET p${skillId} = $1 WHERE id = 1`, [value], function( err, res ) {

			if( err ) {
				return console.error( 'error running UPDATE', err );
			};

		});

	};

	delete(){

		this.pool.query( 'DELETE FROM parameters WHERE id = $1', [req.params.id], function( err, res ) {

			if( err ) {
				return console.error( 'error running DELETE', err );
			};

		});
	
	};

};

class Server extends Database {

	constructor(){

		super();

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
		//this.emitter.init( ws ); // single connection
		this.emitter.init( this.wss ); // for broadcast

		this.select( "1", this.emitter );

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

				case "update":
					this.update( JSONdata.skillId, JSONdata.value );					
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