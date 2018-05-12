
class ClassB {

	constructor(){
		ClassA.someMethod();
		ClassA.anotherMethod();
	};

	static someMethod () {
		console.log( 'Class B Doing someMethod' );
	};

	static anotherMethod () {
		console.log( 'Class A Doing anotherMethod' );
	};

};

module.exports = ClassB;
var ClassA = require( "./classA.js" );

let classX = new ClassB();