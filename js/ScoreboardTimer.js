/*
* Timer
*/
class ScoreboardTimer{

	constructor( callback ) {

		this.time = 0;
		this.status = 0;
		this.timer_id;
		this.callback = callback;
		this.generateTime();

	};

	Start() {

		if( this.status == 0 ) {
			this.status = 1;
			this.timer_id = setInterval( function() {
				this.time++;
				this.generateTime();
				if( typeof( this.callback ) === 'function') this.callback( this.time );
			}.bind( this ), 1000);
		};

	};

	Stop() {

		if( this.status == 1 ){
			this.status = 0;
			clearInterval( this.timer_id );
		};

	};

	Reset()	{

		this.time = 0;
		this.generateTime();

	};

	generateTime() {

		this.second = this.time % 60;
		this.minute = Math.floor( this.time / 60 ) % 60;
		this.second = ( this.second < 10 ) ? '0' + this.second : this.second;
		this.minute = ( this.minute < 10 ) ? '0' + this.minute : this.minute;
		document.getElementsByClassName('second')[ 0 ].innerText = this.second;
		document.getElementsByClassName('minute')[ 0 ].innerText = this.minute;

	};
};