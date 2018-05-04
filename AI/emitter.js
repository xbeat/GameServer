class Queue {

	constructor( ws ) {
		this.ws = ws;
		this.redTeam = new Array();
		this.blueTeam = new Array();
		this.objectCache = new Object();
	};

	objectize( obj ) {


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

	getValue( team, lobby ) {

		if ( this.size( team ) > 0 ){
			let action = this.last( team );
			this.remove( team );
			return action;
		} else {
			return	{ player: {
							team: team,
							lobby: lobby,
							state: "wait"
						}
					};
		};

	};	

	size( team ) {
		return this[team].length;
	};

};


class Emitter {

	constructor(){};

	static init( ws ) {

		this.ws = ws;
		this.queue = new Queue( ws );
	};

	static send( data ) {

		console.log( "Emitter send " + data.player.state );

		switch( data.player.state ) {
				
				case "connected":
					this.ws.send( JSON.stringify( data ) );
					break;

				case "shoot":
				case "reset":
					this.queue.add ( data, data.player.team );
					break;

		};

	};

};

module.exports = Emitter;