/**
 * Defending
 */

class Defending {

    constructor(){ };

    //this is a singleton
    static Instance() {
        return new Defending();
    };

    Enter( team ) {
        if ( def( DEBUG_TEAM_STATES ) ) {
            console.log( team.Name() + " entering Defending state" );
        };

        //these define the home regions for this state of each of the players
        let BlueRegions = [ 1, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14 ];
        let RedRegions = [ 29, 27, 26, 25, 24, 23, 22, 20, 18, 17, 16 ];

        //set up the player's home regions
        if ( team.Color() == SoccerTeam.blue() ) {
            TeamStates.ChangePlayerHomeRegions( team, BlueRegions );
        } else {
            TeamStates.ChangePlayerHomeRegions( team, RedRegions );
        };

        //if a player is in either the Wait or ReturnToHomeRegion states, its
        //steering target must be updated to that of its new home region
        team.UpdateTargetsOfWaitingPlayers();
    };

    Execute( team ) {
        //if in control change states
        if ( team.InControl() ) {
            team.GetFSM().ChangeState( Attacking.Instance() );
            return;
        };
    };

    Exit( team ) {
    };

    OnMessage( e, t ) {
        return false;
    };
};

module.exports = Defending;

const Attacking = require( '../modules/Attacking.js' );
const SoccerTeam = require( '../modules/SoccerTeam.js' );
const TeamStates = require( '../modules/TeamStates.js' );