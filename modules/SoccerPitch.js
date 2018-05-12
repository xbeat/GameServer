const Vector2D = require( '../modules/Vector2D.js' );
const SoccerTeam = require( '../modules/SoccerTeam.js' );
const SoccerBall = require( '../modules/SoccerBall.js' );
const Wall2D = require( '../modules/Wall2D.js' );
const Region = require( '../modules/Region.js' );
const Goal = require( '../modules/Goal.js' );
const ParamLoader = require( '../modules/ParamLoader.js' );
const PrepareForKickOff = require( '../modules/PrepareForKickOff.js' );

/**
 *  Desc:   A SoccerPitch is the main game object. It owns instances of
 *          two soccer teams, two goals, the playing area, the ball
 *          etc. This is the root class for all the game updates and
 *          renders etc
 * 
 */

class SoccerPitch {

    /**
     ** this instantiates the regions the players utilize to  position
     ** themselves
     */
    CreateRegions( width, height ) {
        //index into the vector
        let idx = this.m_Regions.length - 1;

        for ( let col = 0; col < this.NumRegionsHorizontal; ++col ) {
            for ( let row = 0; row < this.NumRegionsVertical; ++row ) {
                this.m_Regions[ idx ] = new Region( this.PlayingArea().Left() + col * width,
                        this.PlayingArea().Top() + row * height,
                        this.PlayingArea().Left() + ( col + 1 ) * width,
                        this.PlayingArea().Top() + ( row + 1 ) * height,
                        idx );
                --idx;
            };
        };
    };

    //------------------------------- ctor -----------------------------------
    //------------------------------------------------------------------------
    constructor( cx, cy ) {
        this.NumRegionsHorizontal = 6;
        this.NumRegionsVertical = 3;
        this.m_cxClient = cx;
        this.m_cyClient = cy;
        this.m_bPaused = false;
        this.m_bGoalKeeperHasBall = false;
        this.m_Regions = new Array( this.NumRegionsHorizontal * this.NumRegionsVertical );
        this.m_bGameOn = true;
        //define the playing area
        this.m_pPlayingArea = new Region( 20, 20, cx - 20, cy - 10 );
        this.m_vecWalls = new Array();

        //create the regions  
        this.CreateRegions( this.PlayingArea().Width() / this.NumRegionsHorizontal,
                this.PlayingArea().Height() / this.NumRegionsVertical );

        //create the goals
        this.m_pRedGoal = new Goal( new Vector2D( this.m_pPlayingArea.Left(), ( cy - Prm.GoalWidth ) / 2 ),
                new Vector2D( this.m_pPlayingArea.Left(), cy - ( cy - Prm.GoalWidth ) / 2 ),
                new Vector2D( 1, 0 ) );

        this.m_pBlueGoal = new Goal( new Vector2D( this.m_pPlayingArea.Right(), ( cy - Prm.GoalWidth ) / 2 ),
                new Vector2D( this.m_pPlayingArea.Right(), cy - ( cy - Prm.GoalWidth ) / 2),
                new Vector2D( -1, 0 ) );

        //create the soccer ball
        this.m_pBall = new SoccerBall( new Vector2D( this.m_cxClient / 2.0, this.m_cyClient / 2.0 ),
                Prm.BallSize,
                Prm.BallMass,
                this.m_vecWalls );

        //create the teams 
        this.m_pRedTeam = new SoccerTeam( this.m_pRedGoal, this.m_pBlueGoal, this, SoccerTeam.red() );
        this.m_pBlueTeam = new SoccerTeam( this.m_pBlueGoal, this.m_pRedGoal, this, SoccerTeam.blue() );

        //make sure each team knows who their opponents are
        this.m_pRedTeam.SetOpponents( this.m_pBlueTeam );
        this.m_pBlueTeam.SetOpponents( this.m_pRedTeam );

        //create the walls
        let TopLeft = new Vector2D( this.m_pPlayingArea.Left(), this.m_pPlayingArea.Top() );
        let TopRight = new Vector2D( this.m_pPlayingArea.Right(), this.m_pPlayingArea.Top() );
        let BottomRight = new Vector2D( this.m_pPlayingArea.Right(), this.m_pPlayingArea.Bottom() );
        let BottomLeft = new Vector2D( this.m_pPlayingArea.Left(), this.m_pPlayingArea.Bottom() );

        this.m_vecWalls.push( new Wall2D( BottomLeft, this.m_pRedGoal.RightPost() ) );
        this.m_vecWalls.push( new Wall2D( this.m_pRedGoal.LeftPost(), TopLeft ) );
        this.m_vecWalls.push( new Wall2D( TopLeft, TopRight ) );
        this.m_vecWalls.push( new Wall2D( TopRight, this.m_pBlueGoal.LeftPost() ) );
        this.m_vecWalls.push( new Wall2D( this.m_pBlueGoal.RightPost(), BottomRight ) );
        this.m_vecWalls.push( new Wall2D( BottomRight, BottomLeft ) );

        let p = new ParamLoader();
        let tick = 0;

    };

    //-------------------------------- dtor ----------------------------------
    //------------------------------------------------------------------------
    finalize() {
        super.finalize();
        this.m_pBall = null;

        this.m_pRedTeam = null;
        this.m_pBlueTeam = null;

        this.m_pRedGoal = null;
        this.m_pBlueGoal = null;

        this.m_pPlayingArea = null;

        for ( let i = 0; i < this.m_Regions.size(); ++i ) {
            this.m_Regions[i] = null;
        };
    };

    /**
     *  fixed frame rate (60 by default) so we don't need
     *  to pass a time_elapsed as a parameter to the game entities
     */
    Update() {
        if ( this.m_bPaused ) {
            return;
        };

        //update the balls
        this.m_pBall.Update();

        //update the teams
        this.m_pRedTeam.Update();
        this.m_pBlueTeam.Update();

        //if a goal has been detected reset the pitch ready for kickoff
        if ( this.m_pBlueGoal.Scored( this.m_pBall ) || this.m_pRedGoal.Scored( this.m_pBall ) || this.gameReset == true ) {
            this.m_bGameOn = false;

            if ( this.gameReset == true ){
				this.gameReset = false;
	            this.m_pBlueGoal.m_iNumGoalsScored = 0;
    	        this.m_pRedGoal.m_iNumGoalsScored = 0;            
            };

            //update score
            // the score is inversed because the team that make the score 
            // has not access to the other team object ( Goal.js:25 )
            //document.getElementById("scoreTeamA").innerText = this.m_pBlueGoal.m_iNumGoalsScored;
            //document.getElementById("scoreTeamB").innerText = this.m_pRedGoal.m_iNumGoalsScored;            

            //reset the ball                                                      
            this.m_pBall.PlaceAtPosition( new Vector2D( this.m_cxClient / 2.0, this.m_cyClient / 2.0 ) );

            //get the teams ready for kickoff
            this.m_pRedTeam.GetFSM().ChangeState( PrepareForKickOff.Instance() );
            this.m_pBlueTeam.GetFSM().ChangeState( PrepareForKickOff.Instance() );
        };
    };

    //------------------------------ Render ----------------------------------
    //------------------------------------------------------------------------
    Render() {
        //draw the grass
        //gdi.DarkGreenPen();
        //gdi.DarkGreenBrush();
        //gdi.Rect(0, 0, this.m_cxClient, this.m_cyClient );
        
        //gdi.clearRect( 0, 0, canvas.width, canvas.height );

        //render regions
        if ( Prm.bRegions ) {
            for ( let r = 0; r < this.m_Regions.length; ++r ) {
                this.m_Regions[ r ].Render( true );
            };
        };

        //render the goals
        //gdi.HollowBrush();
        //gdi.RedPen();
        //gdi.Rect( this.m_pPlayingArea.Left(), ( this.m_cyClient - Prm.GoalWidth ) / 2, this.m_pPlayingArea.Left() + 40,
        //        this.m_cyClient - ( this.m_cyClient - Prm.GoalWidth ) / 2 );

        //gdi.BluePen();
        //gdi.Rect( this.m_pPlayingArea.Right(), ( this.m_cyClient - Prm.GoalWidth ) / 2, this.m_pPlayingArea.Right() - 40,
        //        this.m_cyClient - ( this.m_cyClient - Prm.GoalWidth ) / 2 );

        //render the pitch markings
        //gdi.WhitePen();
        //gdi.Circle( this.m_pPlayingArea.Center(), this.m_pPlayingArea.Width() * 0.125 );
        //gdi.Line( this.m_pPlayingArea.Center().x, this.m_pPlayingArea.Top(), this.m_pPlayingArea.Center().x, this.m_pPlayingArea.Bottom() );
        //gdi.WhiteBrush();
        //gdi.Circle( this.m_pPlayingArea.Center(), 2.0 );

        //the ball
        //gdi.WhitePen();
        //gdi.WhiteBrush();
        this.m_pBall.Render();

        //Render the teams
        this.m_pRedTeam.Render();
        this.m_pBlueTeam.Render();

        //render the walls
        //gdi.WhitePen();
        //for ( let w = 0; w < this.m_vecWalls.length; ++w ) {
        //    this.m_vecWalls[ w ].Render();
        //};

        //show the score
        //gdi.TextColor( 255, 0, 0 ); // red
        //gdi.TextAtPos( ( this.m_cxClient / 2 ) - 50, this.m_cyClient - 8,
        //        "Red: " + ttos( this.m_pBlueGoal.NumGoalsScored() ) );

        //gdi.TextColor( 0, 0, 255 ); // blue
        //gdi.TextAtPos( ( this.m_cxClient / 2 ) + 10, this.m_cyClient - 8, 
        //        "Blue: " + ttos( this.m_pRedGoal.NumGoalsScored() ) );

        return true;
    };

    TogglePause() {
        this.m_bPaused = !this.m_bPaused;
    };

    Paused() {
        return this.m_bPaused;
    };

    cxClient() {
        return this.m_cxClient;
    };

    cyClient() {
        return this.m_cyClient;
    };

    GoalKeeperHasBall() {
        return this.m_bGoalKeeperHasBall;
    };

    SetGoalKeeperHasBall( b ) {
        this.m_bGoalKeeperHasBall = b;
    };

    PlayingArea() {
        return this.m_pPlayingArea;
    };

    Walls() {
        return this.m_vecWalls;
    };

    Ball() {
        return this.m_pBall;
    };

    GetRegionFromIndex( idx ) {
        //assert ( ( idx >= 0 ) && ( idx < this.m_Regions.size() ) );
        return this.m_Regions[ idx ];
    };

    GameOn() {
        return this.m_bGameOn;
    };

    SetGameOn() {
        this.m_bGameOn = true;
    };

    SetGameOff() {
        this.m_bGameOn = false;
    };
};

module.exports = SoccerPitch;


