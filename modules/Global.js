/*
* Global value
*
*/

global.MaxInt = Number.MAX_SAFE_INTEGER;
global.MaxDouble = Number.MAX_VALUE;
global.MinDouble = Number.MIN_VALUE;
global.MaxFloat = Number.MAX_VALUE;
global.MinFloat = Number.MIN_VALUE;
global.Pi = Math.PI;
global.TwoPi = Math.PI * 2;
global.HalfPi = Math.PI / 2;
global.QuarterPi = Math.PI / 4;
global.EpsilonDouble = Number.EPSILON;

global.ttos = function( s ){
    return String( s );
};

//----------- Globals
global.objReceiverRef = new Object();
global.m_iNextValidID = 0;
global.AllPlayers = new Array();
global.MessageTypes = {
    Msg_ReceiveBall: "Msg_ReceiveBall",
    Msg_PassToMe: "Msg_PassToMe",
    Msg_SupportAttacker: "Msg_SupportAttacker",
    Msg_GoHome: "Msg_GoHome",
    Msg_Wait: "Msg_Wait",
    default:"INVALID MESSAGE!!"
};