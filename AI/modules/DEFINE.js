/**
 * This class substitute C++ preprocessor. 
 * 
 * 
 */
 // Loggin flags
global.SHOW_TEAM_STATE = true;
global.SHOW_SUPPORTING_PLAYERS_TARGET = true;
global.SHOW_MESSAGING_INFO = true;
global.DEBUG_TEAM_STATES = true;
global.GOALY_STATE_INFO_ON = true;
global.PLAYER_STATE_INFO_ON = true;

global.def = function( D ) {
	return D;
};

global.define = function( D ) {
	D = true;
	return D;
};

global.undef = function( D ) {
	D = false;
	return D;
};