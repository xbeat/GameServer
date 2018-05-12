class ClassA {

	constructor(){
		ClassB.someMethod();
		ClassB.anotherMethod();
	};

	static someMethod () {
		console.log( 'Class A Doing someMethod' );
	};

	static anotherMethod () {
		console.log( 'Class A Doing anotherMethod' );
	};

};

module.exports = ClassA;
var ClassB = require( "./classB.js" );

let classX = new ClassA();
