const InterceptBall = require( '../modules/InterceptBall.js' );

/**
 * GlobalKeeperState.js
 */

class GlobalKeeperState {

    constructor(){ };

    //this is a singleton
    static Instance() {
        return new GlobalKeeperState();
    };


    Enter( keeper ) {
    };

    Execute( keeper ) {
    };

    Exit( keeper ) {
    };

    OnMessage( keeper, telegram ) {
        switch ( telegram.Msg ) {
            case MessageTypes.Msg_GoHome:
                keeper.SetDefaultHomeRegion();
                keeper.GetFSM().ChangeState( ReturnHome.Instance() );
            break;

            case MessageTypes.Msg_ReceiveBall:
                keeper.GetFSM().ChangeState( InterceptBall.Instance() );
            break;

        };//end switch

        return false;
    };
};

module.exports = GlobalKeeperState;