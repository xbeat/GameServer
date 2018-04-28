class User{

	constructor( id ) {

    	this.id = id;
    	this.state = "idle";
    	this.team = "";
    	this.LobbyArr = new Array();

    	console.log( "Client State:" + this.state + " id:" + this.id );

    };

    changeState( newState ) {
        this.state = newState;
    };

    addLobby( lobbyId ) {
        this.LobbyArr.push( lobbyId );
        this.lobbyAssigned = lobbyId;
    };

    removeLobby( lobbyId ) {
        this.LobbyArr.pop( lobbyId );
    };

    addTeam( team ) {
        this.team = team;
    };

};

module.exports = User;