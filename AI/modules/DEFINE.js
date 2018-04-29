/**
 * This class substitute C++ preprocessor. 
 * 
 * 
 */
 // Loggin flags
global.SHOW_TEAM_STATE = false;
global.SHOW_SUPPORTING_PLAYERS_TARGET = false;
global.SHOW_MESSAGING_INFO = false;
global.DEBUG_TEAM_STATES = false;
global.GOALY_STATE_INFO_ON = false;
global.PLAYER_STATE_INFO_ON = false;

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