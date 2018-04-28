class Positioning{

	constructor(){

	};

	/**
	* Set all player Random position.
	* 
	*/
	goRandom(){

		function getRandomInt( min, max ){

			return Math.random() * ( max - min ) + min;
		};

		for ( var i = 0; i < gameClient.playerNum; i++ ){

			gameClient.players[i].boid.destination.x = getRandomInt( 60, 960 );
			gameClient.players[i].boid.destination.y = getRandomInt( 40, 580 );

		};

		this.state.popState();
		this.state.pushState( this.actions.arrive );

	};

	/**
	* Set all player Home position.
	* 
	*/
	goHome(){

		for ( let i = 0; i < gameClient.playerNum; i++ ){

			var distribute = function( val, max, min ) { return ( val - min ) / ( max - min ); }; //normalize
			var value = distribute( i, gameClient.playerNum, 0 ) * 18;
			var row = parseInt( value / 6 );
			var column = value % 6;      
			gameClient.players[i].boid.destination.x = column * 150 + getRandomInt( 60,90 ); 
			gameClient.players[i].boid.destination.y = row * 187.5 + getRandomInt( 90, 120 );

		};

		this.state.popState();
		this.state.pushState( this.actions.arrive );

	};

	/**
	* Set all player formation position.
	* 
	*/

	goFormation( ){

		var formation = [
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

		let pointerFormation = this.state.schemaRedTeam;

		for ( let c = 0; c < formation[ pointerFormation ].length; c++ ) {
			stepX += ( width / 2 ) / formation[ pointerFormation ].length;
			for ( let i = 0; i < formation[ pointerFormation ][ c ]; i++ ){
				let step = height / formation[ pointerFormation ][ c ]; 
				stepY = step * ( i + 1 ) - step / 2;
				this.players[index].boid.destination.x = stepX - 50;
				this.players[index].boid.destination.y = stepY;
				index++;
			};
			stepY = 0;
		};

		pointerFormation = this.stete.schemaBlueTeam;

		for ( let c = 0; c < formation[ pointerFormation ].length; c++ ) {
			stepX += ( width / 2 ) / formation[ pointerFormation ].length;
			for ( let i = 0; i < formation[ pointerFormation ][ c ]; i++ ){
				var step = height / formation[ pointerFormation ][ c ]; 
				stepY = step * ( i + 1 ) - step / 2;
				this.players[ index ].boid.destination.x = stepX - 115;
				this.players[ index ].boid.destination.y = stepY;
				index++;
			};
			stepY = 0;
		};

		//goalkeeper
		this.players[ 0 ].boid.destination.x = 30;
		this.players[ 0 ].boid.destination.y = 300;
		this.players[ 21 ].boid.destination.x = 950;
		this.players[ 21 ].boid.destination.y = 300;

		this.state.popState();
		this.state.pushState( this.actions.arrive );

	};

};	

module.exports = Positioning;
