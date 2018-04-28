/**
 *   Desc:   Derived from a PlayerBase, this class encapsulates a player
 *           capable of moving around a soccer pitch, kicking, dribbling,
 *           shooting etc
 * 
 */

class FieldPlayer extends PlayerBase {

    //----------------------------- ctor -------------------------------------
    //------------------------------------------------------------------------
    constructor( home_team,
                home_region,
                start_state,
                heading,
                velocity,
                mass,
                max_force,
                max_speed,
                max_turn_rate,
                scale,
                role,
                id ) {

        super( home_team,
                home_region,
                heading,
                velocity,
                mass,
                max_force,
                max_speed,
                max_turn_rate,
                scale,
                role );

    
        this.id = id;

        //set up the state machine
        this.m_pStateMachine = new StateMachine( this );

        if ( start_state != null ) {
            this.m_pStateMachine.SetCurrentState( start_state );
            this.m_pStateMachine.SetPreviousState( start_state );
            this.m_pStateMachine.SetGlobalState( GlobalPlayerState.Instance() );

            this.m_pStateMachine.CurrentState().Enter( this );
        };

        this.m_pSteering.SeparationOn();

        //set up the kick regulator
        this.m_pKickLimiter = new Regulator( Prm.PlayerKickFrequency );
    };

    //------------------------------- dtor ---------------------------------------
    //----------------------------------------------------------------------------
    
    finalize() {
        this.m_pKickLimiter = null;
        this.m_pStateMachine = null;
    };

    /**
     * call this to update the player's position and orientation
     */
    Update() {
        //run the logic for the current state
        this.m_pStateMachine.Update();

        //calculate the combined steering force
        this.m_pSteering.Calculate();

        //if no steering force is produced decelerate the player by applying a
        //braking force
        if ( this.m_pSteering.Force().isZero() ) {
            let BrakingRate = 0.8;

            this.m_vVelocity.mul( BrakingRate );
        };

        //the steering force's side component is a force that rotates the 
        //player about its axis. We must limit the rotation so that a player
        //can only turn by PlayerMaxTurnRate rads per update.
        let TurningForce = this.m_pSteering.SideComponent();

        TurningForce = utils.clamp( TurningForce, -Prm.PlayerMaxTurnRate, Prm.PlayerMaxTurnRate );

        //rotate the heading vector
        Transformation.Vec2DRotateAroundOrigin( this.m_vHeading, TurningForce );

        //make sure the velocity vector points in the same direction as
        //the heading vector
        this.m_vVelocity = Vector2D.mul( this.m_vHeading, this.m_vVelocity.Length() );
        
        //and recreate m_vSide
        this.m_vSide = this.m_vHeading.Perp();


        //now to calculate the acceleration due to the force exerted by
        //the forward component of the steering force in the direction
        //of the player's heading
        this.accel = Vector2D.mul( this.m_vHeading, this.m_pSteering.ForwardComponent() / this.m_dMass );

        this.m_vVelocity.add( this.accel );

        //make sure player does not exceed maximum velocity
        this.m_vVelocity.Truncate( this.m_dMaxSpeed );
        //update the position
        this.m_vPosition.add( this.m_vVelocity );
       
        //enforce a non-penetration constraint if desired
        if ( Prm.bNonPenetrationConstraint ) {
            EntityFunctionTemplates.EnforceNonPenetrationContraint( this, Global.AllPlayers );
        };
    };

    //--------------------------- Render -------------------------------------
    //
    //------------------------------------------------------------------------

    Render() {
        //gdi.TransparentText();
        //gdi.TextColor(Cgdi.grey);

        //set appropriate team color
        if ( this.Team().Color() == SoccerTeam.blue() ) {
            gdi.BluePen();
        } else {
            gdi.RedPen();
        };

        //render the player's body
        this.m_vecPlayerVBTrans = Transformation.WorldTransform( this.m_vecPlayerVB,
                this.Pos(),
                this.Heading(),
                this.Side(),
                this.Scale() );
        gdi.ClosedShape( this.m_vecPlayerVBTrans );

        //and his head
        gdi.BrownBrush();
        if ( Prm.bHighlightIfThreatened && ( this.Team().ControllingPlayer() == this ) && this.isThreatened() ) {
            gdi.YellowBrush();
        };
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

        //render the state
        if ( Prm.bStates ) {
            gdi.TextColor( 250, 250, 250 );
            gdi.TextAtPos( this.m_vPosition.x, this.m_vPosition.y - 25,
                    new String( this.m_pStateMachine.GetNameOfCurrentState() ) );
        };

        //show IDs
        if ( Prm.bIDs ) {
            gdi.TextColor( 250, 250, 250 );
            gdi.TextAtPos( this.Pos().x - 20, this.Pos().y - 25, ttos( this.ID() ) );
        };

        if ( Prm.bViewTargets ) {
            gdi.RedBrush();
            gdi.Circle( this.Steering().Target(), 3 );
            gdi.TextColor( 250, 250, 250 );
            gdi.TextAtPos( this.Steering().Target(), ttos( this.ID() ) + " - " +  new String( this.m_pStateMachine.GetNameOfCurrentState() ) );
        };
    };

    /**
     * routes any messages appropriately
     */
    HandleMessage( msg ) {
        return this.m_pStateMachine.HandleMessage( msg );
    };

    GetFSM() {
        return this.m_pStateMachine;
    };

    isReadyForNextKick() {
        return this.m_pKickLimiter.isReady();
    };
};
