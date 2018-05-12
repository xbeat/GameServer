class Queue {

	constructor( ws ) {
		this.ws = ws;
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
		this.emitSoccerBall = true;

	};


	static SoccerBall( position ) {

		let data = {
				e: "B",
				P: { 
					x: position.x,
					y: position.y
				}
			};

		//console.log( "Ball ", data.m_pBall.x, data.m_pBall.y );
		//this.add( obj, "redTeam" );

		if ( this.ws.readyState == this.ws.OPEN && this.emitSoccerBall == true ){
			this.ws.send( JSON.stringify( data ) );
			this.emitSoccerBall = false;
		} else {
			this.emitSoccerBall = true;
		};

	};    

	static FieldPlayer( position, heading, index, color ) {

		let data = {
				e: "F",
				P: { 
					x: position.x,
					y: position.y
				},
				H: { 
					x: heading.x,
					y: heading.y
				},
				I: index,
				C: color.substring( 0, 1 )
			};

		//console.log( "FieldPlayer ID " + data.m_ID + " Pos ", data.m_vPosition.x, data.m_vPosition.y );
		//this.add( obj, "redTeam" );

		if ( this.ws.readyState == this.ws.OPEN ){
			this.ws.send( JSON.stringify( data ) );
		};
	
	};


	static GoalKeeper( position, lookAt, index, color ) {

		let data = {
				e: "G",
				P: { 
					x: position.x,
					y: position.y
				},
				L: { 
					x: lookAt.x,
					y: lookAt.y
				},
				I: index,
				C: color.substring( 0, 1 )
			};

		//console.log( "FieldPlayer ID " + data.m_ID + " Pos ", data.m_vPosition.x, data.m_vPosition.y );
		//this.add( obj, "redTeam" );

		if ( this.ws.readyState == this.ws.OPEN ){
			this.ws.send( JSON.stringify( data ) );
		};
	
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