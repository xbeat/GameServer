
class Emitter {

	constructor(){};

	static init( wss ) {

		this.wss = wss;

	};

	static Broadcast( data ){
		
		// Broadcast to all.
		this.wss.clients.forEach( function each( client ) {
			if ( client.readyState === client.OPEN ) {
				client.send( JSON.stringify( data ) );
			};
		}.bind( this ) );
	
	};


	static SoccerBall( position ) {

		let data = {
				e: "B",
				P: { 
					x: position.x,
					y: position.y
				}
			};

		//if ( this.ws.readyState == this.ws.OPEN ){
		//	this.ws.send( JSON.stringify( data ) );
		//};

		Emitter.Broadcast( data );

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

		//if ( this.ws.readyState == this.ws.OPEN ){
		//	this.ws.send( JSON.stringify( data ) );
		//};

		Emitter.Broadcast( data );
	
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

		//if ( this.ws.readyState == this.ws.OPEN ){
		//	this.ws.send( JSON.stringify( data ) );
		//};

		Emitter.Broadcast( data );
	
	};

	static Parameters( dataDb ) {

		let data = {
				e: "P",
				V: dataDb
			};

		//if ( this.ws.readyState == this.ws.OPEN ){
		//	this.ws.send( JSON.stringify( data ) );
		//};

		Emitter.Broadcast( data );

	}; 

};

module.exports = Emitter;