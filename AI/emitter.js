class Queue {

	constructor( ws ) {
		this.ws = ws;
		this.redTeam = new Array();
		this.blueTeam = new Array();
		this.objectCache = new Object();
	};

	prepare( obj ) {

				let m_pOwner = {

					FieldPlayer: {

						default_entity_type: -1,
						id: 16,
						m_ID: 8,
						m_PlayerRole: "defender",
						m_bTag: false,
						m_dBoundingRadius: 10,
						m_dDistSqToBall: 1250,
						m_dMass: 3,
						m_dMaxForce: 1,
						m_dMaxSpeed: 1.6,
						m_dMaxTurnRate: 0.4,
						m_iDefaultRegion: 10,
						m_iHomeRegion: 10,
						m_iType: -1
					};
				};

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