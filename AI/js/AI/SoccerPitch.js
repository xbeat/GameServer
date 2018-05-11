/**
 *  Desc:   A SoccerPitch is the main game object. It owns instances of
 *          two soccer teams, two goals, the playing area, the ball
 *          etc. This is the root class for all the game updates and
 *          renders etc
 * 
 */

class SoccerPitch {

    //------------------------------- ctor -----------------------------------
    //------------------------------------------------------------------------
    constructor( cx, cy ) {

		let BallSize = 5.0;

        //create the soccer ball
        this.m_pBall = new SoccerBall( BallSize );

        //create the teams 
        this.m_pRedTeam = new SoccerTeam( "red" );
        this.m_pBlueTeam = new SoccerTeam( "blue" );

        this.pitch();

    };

    //------------------------------ Render ----------------------------------
    //------------------------------------------------------------------------
    Render() {

        gdi.clearRect( 0, 0, canvas.width, canvas.height );

        //the ball
        this.m_pBall.Render();

        //Render the teams
        this.m_pRedTeam.Render();
        this.m_pBlueTeam.Render();

        return true;
    };

    pitch(){
        //http://www.fifa.com/img/worldfootball/lotg/law1/Law1_Page13_01.jpg
        let canvasPitch = document.createElement( "canvas" );
        document.body.appendChild( canvasPitch );
        canvasPitch.style.position = "fixed";
        canvasPitch.style.bottom = "10px";
        canvasPitch.style.left = "50%";
        canvasPitch.style.opacity = ".6";
        canvasPitch.style.margin = "0 auto";
        canvasPitch.style.zIndex = "-97";
        canvasPitch.style.transform = "translate( -50%, 0 )";
        canvasPitch.style.zIndex = "20";
        canvasPitch.id = "canvasPitch";
        //canvasPitch.style.transform = "scale(0.7)";

        //canvasPitch.style.transform = "translate( -50%, 0 )";
        canvasPitch.style.backgroundColor = "#009900";    
        canvasPitch.width = 460;
        canvasPitch.height = 290;

        let contextPitch = canvasPitch.getContext('2d');
        let ratio = 1.15;
        let offsetY = 20;

        //Pitch
        contextPitch.strokeStyle = '#fff';
        contextPitch.fillStyle = '#f00';
        contextPitch.lineWidth = 1.5;
        contextPitch.rect( 20 * ratio, 0 * ratio + offsetY, 360 * ratio, 225 * ratio );
        contextPitch.stroke();

        //Center
        contextPitch.beginPath();
        contextPitch.arc( 183 * ratio + offsetY, 112.5 * ratio + offsetY, 30 * ratio, 0, 2 * Math.PI, false ); //big circle
        contextPitch.moveTo( 183 * ratio + offsetY, 0 * ratio + offsetY );
        contextPitch.lineTo( 183 * ratio + offsetY, 225 * ratio + offsetY );//center line
        contextPitch.stroke();
        contextPitch.beginPath();
        contextPitch.arc( 183 * ratio + offsetY, 112.5 * ratio + offsetY, 1 * ratio, 0, 2 * Math.PI, false ); //small circle
        contextPitch.stroke();

        //Big area
        contextPitch.rect( 20 * ratio, 41.25 * ratio + offsetY, 54 * ratio, 142 * ratio ); //left
        contextPitch.rect( 326 * ratio, 41.25 * ratio + offsetY, 54 * ratio, 142 * ratio ); //right

        //Small area
        contextPitch.rect( 20 * ratio, 82 * ratio + offsetY, 18 * ratio, 60 * ratio ); //left
        contextPitch.rect( 362 * ratio, 82 * ratio + offsetY, 18 * ratio, 60 * ratio ); //right
        contextPitch.stroke();

        //circle area
        contextPitch.beginPath()
        contextPitch.arc( 56 * ratio, 112.5 * ratio + offsetY, 1 * ratio, 0, 2 * Math.PI, false ); //left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc( 344 * ratio, 112.5 * ratio + offsetY, 1 * ratio, 0, 2 * Math.PI, false ); //right
        contextPitch.stroke();

        //semi circle 
        contextPitch.beginPath()
        contextPitch.arc( 46 * ratio, 112.5 * ratio + offsetY, 40 * ratio, -0.25 * Math.PI, 0.25 * Math.PI, false ); //left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc( 354 * ratio, 112.5 * ratio + offsetY, 40 * ratio, 0.75 * Math.PI, 1.25 * Math.PI, false ); //left
        contextPitch.stroke();

        //corner
        contextPitch.beginPath()
        contextPitch.arc( 20 * ratio, 0 + offsetY, 7 * ratio, 0 * Math.PI, 0.50 * Math.PI, false );//top left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc( 20 * ratio, 225 * ratio + offsetY, 7 * ratio, -0.50 * Math.PI, 0 * Math.PI, false );//bottom left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc( 380 * ratio, 0 + offsetY, 7 * ratio, 0.50 * Math.PI, 1 * Math.PI, false );//top right
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc( 380 * ratio, 225 * ratio + offsetY, 7 * ratio, 1 * Math.PI, 1.50 * Math.PI, false );//bottom right
        contextPitch.stroke();

        //Golie
        contextPitch.rect( 12 * ratio, 92 * ratio + offsetY, 8 * ratio, 24 * ratio + offsetY ); //left
        contextPitch.rect( 380 * ratio, 92 * ratio + offsetY, 8 * ratio, 24 * ratio + offsetY ); //right
        contextPitch.stroke();

        //external line
        contextPitch.moveTo( 12 * ratio, 24 * ratio + offsetY );
        contextPitch.lineTo( 20 * ratio, 24 * ratio + offsetY );//top left
        contextPitch.stroke();

        contextPitch.moveTo( 12 * ratio, 201 * ratio + offsetY );
        contextPitch.lineTo( 20 * ratio, 201 * ratio + offsetY );//bottom left
        contextPitch.stroke();

        contextPitch.moveTo( 380 * ratio, 24 * ratio + offsetY );
        contextPitch.lineTo( 388 * ratio, 24 * ratio + offsetY );//top right
        contextPitch.stroke();

        contextPitch.moveTo( 380 * ratio, 201 * ratio + offsetY );
        contextPitch.lineTo( 388 * ratio, 201 * ratio + offsetY );//bottom right
        contextPitch.stroke();
    };
  
};

class Vector2D {

    constructor( a = 0.0, b = 0.0 ) {

        if ( typeof a  === 'object' ){
            this.x = a.x;
            this.y = a.y;
        } else {
            this.x = a;
            this.y = b;
        };    
    };

    set( v ) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };
    
    /**
     * returns the vector that is perpendicular to this one.
     */
    Perp() {
        return new Vector2D( -this.y, this.x );
    };

};

/**
 *  Desc:   class to define a team of soccer playing agents. A SoccerTeam
 *          contains several field players and one goalkeeper. A SoccerTeam
 *          is implemented as a finite state machine and has states for
 *          attacking, defending, and KickOff.
 * 
 */

class SoccerTeam {

    //----------------------------- ctor -------------------------------------
    //
    //------------------------------------------------------------------------
    constructor( color ) {

        this.m_Players = new Array();
        this.m_Color = color;
        
        if ( color == "blue" ) {
            //goalkeeper
            this.m_Players.push( new GoalKeeper( this ) );

            //create the players
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );

        } else {
            //goalkeeper
			this.m_Players.push( new GoalKeeper( this ) );

            //create the players
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
            this.m_Players.push( new FieldPlayer( this ) );
                               
        };

    };

    /**
     *  renders the players and any team related info
     */
    Render() {

        for( let it = 0, size = this.m_Players.length; it < size; it++ ){
           this.m_Players[it].Render();
        };

    };

    Color() {
        return this.m_Color;
    };

};

/**
 *  Desc: Definition of a soccer player base class. <del>The player inherits
 *        from the autolist class so that any player created will be 
 *        automatically added to a list that is easily accesible by any
 *        other game objects.</del> (mainly used by the steering behaviors and
 *        player state classes)
 * 
 */

class PlayerBase {

    //----------------------------- ctor -------------------------------------
    //------------------------------------------------------------------------
    constructor( home_team ) {
    
        //the vertex buffer
        this.m_vecPlayerVB = new Array();
        this.m_pTeam = home_team;

        this.m_vHeading = new Vector2D();
        this.m_vVelocity = new Vector2D();
        this.m_vSide = this.m_vHeading.Perp();
        
        this.m_vPosition = new Vector2D();
        this.m_dBoundingRadius = 5.00; 
        this.m_vScale = new Vector2D( { x: 1, y: 1 } );


        //setup the vertex buffers and calculate the bounding radius
        this.m_vecPlayerVB.push(
            new Vector2D( -3, 8 ),
            new Vector2D( 3, 10 ),
            new Vector2D( 3, -10 ),
            new Vector2D( -3, -8 )
        );

    };

    Team() {
        return this.m_pTeam;
    };

    Side() {
        return this.m_vSide;
    };

    Heading() {
        return this.m_vHeading;
    };

    Pos() {
        return new Vector2D( this.m_vPosition );
    };

};

/**
 *  Desc: Class to implement a soccer ball. This class inherits from
 *        MovingEntity and provides further functionality for collision
 *        testing and position prediction.
 * 
 */

class SoccerBall extends PlayerBase {

    constructor() {

        //set up the base class
        super();
    };

    /**
     * Renders the ball
     */
    Render() {

        gdi.WhitePen();
        gdi.BlackBrush();
		gdi.Circle( this.m_vPosition, this.m_dBoundingRadius );

        //const ballPos = scene3D.convertRange( this.m_vPosition );
        //scene3D.ball3D.position.set( ballPos.x, 5, ballPos.y );
    
    };

};


/**
 *   Desc:   Derived from a PlayerBase, this class encapsulates a player
 *           capable of moving around a soccer pitch, kicking, dribbling,
 *           shooting etc
 * 
 */

class FieldPlayer extends PlayerBase {

    //----------------------------- ctor -------------------------------------
    //------------------------------------------------------------------------
    constructor( home_team ) {

        super( home_team );    

    };

    //--------------------------- Render -------------------------------------
    //
    //------------------------------------------------------------------------

    Render() {
        //gdi.TransparentText();
        //gdi.TextColor(Cgdi.grey);

        //set appropriate team color
        if ( this.Team().Color() == "blue" ) {
            gdi.BluePen();
        } else {
            gdi.RedPen();
        };

        //render the player's body
        this.m_vecPlayerVBTrans = Transformation.WorldTransform( this.m_vecPlayerVB,
                this.Pos(),
                this.Heading(),
                this.Side() );

        gdi.ClosedShape( this.m_vecPlayerVBTrans );

        //and his head
        gdi.BrownBrush();
        gdi.Circle( this.Pos(), 6 );

        //Update Player Position
        //const playerPos = scene3D.convertRange( this.m_vPosition );
        // Set new Player position
        //scene3D.players[ this.id ].position.set( playerPos.x, 0, playerPos.y );

        //Ring glow & heatmap ( player selected )
        //if ( this.id == scene3D.playerSelected ){
        //    scene3D.ring.position.set( playerPos.x, 0, playerPos.y );

        	//heatMap.addData( [this.m_vPosition.x, this.m_vPosition.y, 1] );
        	//heatMap.draw();

        //};

        // Get two point from body to get angle of rotation
        let angleRotation = Math.atan2( this.m_vecPlayerVBTrans[2].y - this.m_vecPlayerVBTrans[1].y, 
                                        this.m_vecPlayerVBTrans[2].x - this.m_vecPlayerVBTrans[1].x );
        //Player Rotation
        //if ( this.Team().Color() == SoccerTeam.blue() ) {
        //    scene3D.players[ this.id ].rotation.y = angleRotation * -1;
        //} else {
        //    scene3D.players[ this.id ].rotation.y = angleRotation * -1;
        //};

        //find speed
		let speed = Math.sqrt( this.m_vVelocity.y * this.m_vVelocity.y  + this.m_vVelocity.x * this.m_vVelocity.x );

		//convert rvelocity range
		let speedMinFrom = 0;
		let speedMaxFrom = this.m_dMaxSpeed;

		let speedMinTo = 0 
		let speedMaxTO = 1;

		if ( speed != 0 ) {
			speed = Math.abs( ( speed - speedMinFrom ) * ( speedMaxTO - speedMinTo ) / ( speedMinFrom - speedMaxFrom ) + speedMinTo );
		};

		/*
		// animate player
		if( speed == 0 ) {  //idle
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 1 );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( 0 );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( 0 );
		};

		if( speed == 1 ) {  //run
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 0 );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( 0 );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( 1 );
		};

		if( speed > 0 && speed <= 0.5 ) { // from idle to walk < - > from walk to idle
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 1 - ( speed / 0.5 ) );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( speed / 0.5  );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( 0 );
		};

		if( speed > 0.5 && speed < 1 ) { // from walk to run < - > from run to walk
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 0 );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( 1 - ( ( speed - 0.5 ) / 0.5 ) );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( ( speed - 0.5 ) / 0.5 );
		};
		*/

    };

};

/**
 * Desc:   class to implement a goalkeeper agent
 * 
 */

class GoalKeeper extends PlayerBase {

    //----------------------------- ctor ------------------------------------
    //-----------------------------------------------------------------------
    constructor( home_team ) {

        super( home_team );
        this.m_vLookAt = new Vector2D();
    };

    //--------------------------- Render -------------------------------------
    //
    //------------------------------------------------------------------------
    Render() {

        if ( this.Team().Color() == "blue" ) {
            gdi.BluePen();
        } else {
            gdi.RedPen();
        };

        //render the player's body
        this.m_vecPlayerVBTrans = Transformation.WorldTransform( this.m_vecPlayerVB,
                this.Pos(),
                this.m_vLookAt,
                this.m_vLookAt.Perp() );

        gdi.ClosedShape( this.m_vecPlayerVBTrans );

        //anf his head
        gdi.BrownBrush();
        gdi.Circle( this.Pos(), 6 );
        
        //const playerPos = scene3D.convertRange( this.Pos() );
        //scene3D.players[ this.id ].position.set( playerPos.x, 0, playerPos.y );

        //Ring glow & heatmap ( player selected )
        //if ( this.id == scene3D.playerSelected ){
        //    scene3D.ring.position.set( playerPos.x, 0, playerPos.y );

        	//heatMap.addData( [this.m_vPosition.x, this.m_vPosition.y, 1] );
        	//heatMap.draw();

        //};

        // Get two point from body to get angle of rotation
        let angleRotation = Math.atan2( this.m_vecPlayerVBTrans[2].y - this.m_vecPlayerVBTrans[1].y, 
                                        this.m_vecPlayerVBTrans[2].x - this.m_vecPlayerVBTrans[1].x );

        //Player Rotation
        //if ( this.Team().Color() == SoccerTeam.blue() ) {
        //    scene3D.players[ this.id ].rotation.y = angleRotation * -1;
        //} else {
        //    scene3D.players[ this.id ].rotation.y = angleRotation * -1;
        //};

       	//find speed
		let speed = Math.sqrt( this.m_vVelocity.y * this.m_vVelocity.y  + this.m_vVelocity.x * this.m_vVelocity.x );

		//convert rvelocity range
		let speedMinFrom = 0;
		let speedMaxFrom = this.m_dMaxSpeed;

		let speedMinTo = 0 
		let speedMaxTO = 1;

		if ( speed != 0 ) {
			speed = Math.abs( ( speed - speedMinFrom ) * ( speedMaxTO - speedMinTo ) / ( speedMinFrom - speedMaxFrom ) + speedMinTo );
		};

		/*
		// animate player
		if( speed == 0 ) {  //idle
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 1 );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( 0 );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( 0 );
		};

		if( speed == 1 ) {  //run
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 0 );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( 0 );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( 1 );
		};

		if( speed > 0 && speed <= 0.5 ) { // from idle to walk < - > from walk to idle
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 1 - ( speed / 0.5 ) );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( speed / 0.5  );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( 0 );
		};

		if( speed > 0.5 && speed < 1 ) { // from walk to run < - > from run to walk
			scene3D.mixer[ this.id ].clipAction( 'idle' ).setEffectiveWeight( 0 );    				
			scene3D.mixer[ this.id ].clipAction( 'walk' ).setEffectiveWeight( 1 - ( ( speed - 0.5 ) / 0.5 ) );
			scene3D.mixer[ this.id ].clipAction( 'run' ).setEffectiveWeight( ( speed - 0.5 ) / 0.5 );
		};        
		*/

    };

};
