class VirtualJoystick {

	constructor( options ) {

		this.container = options.container;
		this.maxTravel = options.maxTravel || 32;
		this.style = options.style || "virtualJoystic-stick";

		this.idBase = Math.random();
		this.pointerContainer = this.container.getBoundingClientRect();
		this.heading = new Object();
		this.pointer = null;
		this.currentPos = { x: 0, y: 0 };
		this.speed = 1;

		this.heading.left = false;
		this.heading.right = false;
		this.heading.up = false;
		this.heading.down = false;		
		
		this.container.innerHTML = this.buildBase( this.idBase );

		this.stick = document.createElement( 'div' );
		this.stick.classList.add( this.style );
		document.getElementById( "joystick" + this.idBase ).appendChild( this.stick );

		this.stick.addEventListener( 'mousedown', this.handleDown.bind( this ), true ); 
		document.addEventListener( 'mousemove', this.handleMove.bind( this ) );
		document.addEventListener( 'mouseup', this.handleUp.bind( this ), true );

		this.stick.addEventListener( 'touchstart', this.handleDown.bind( this ), true );
		document.addEventListener( 'touchmove', this.handleMove.bind( this ) );
		document.addEventListener( 'touchend', this.handleUp.bind( this ), true );

	};

	handleDown( event ) {

		event.preventDefault();
		event.stopPropagation();

		this.stick.style.transition = '0s';

		if ( event.changedTouches ) {
			this.pointer = {
				x: event.changedTouches[ 0 ].clientX,
				y: event.changedTouches[ 0 ].clientY,
			};
			return;
		};

		this.pointer = {
			x: event.clientX,
			y: event.clientY,
		};

	};

	handleMove( event ) {

		if ( this.pointer === null ) return;

		event.preventDefault();
		
		if ( event.changedTouches ) {
			event.clientX = event.changedTouches[ 0 ].clientX;
			event.clientY = event.changedTouches[ 0 ].clientY;
		};

		const limit = {
			x: event.clientX - this.pointer.x,
			y: event.clientY - this.pointer.y
		};

		this.angle = Math.atan2( limit.y, limit.x );
		this.distance = Math.min( this.maxTravel, Math.sqrt( Math.pow( limit.x, 2 ) + Math.pow( limit.y, 2 ) ) );
	
		this.currentPos = {
			x: this.distance * Math.cos( this.angle ),
			y: this.distance * Math.sin( this.angle )
		};
	
		this.stick.style.transform = `translate3d(${this.currentPos.x}px, ${this.currentPos.y}px, 0px)`;
		
	};

	handleUp( event ) {

		event.preventDefault();

		if ( this.pointer === null ) return;
		
		this.stick.style.transition = '.2s';
		this.stick.style.transform = `translate3d(0px, 0px, 0px)`;

		this.pointer = null;
		this.currentPos = { x: 0, y: 0 };

	};

	deltaX(){ return this.currentPos.x + this.pointerContainer.left };
	deltaY(){ return this.currentPos.y + this.pointerContainer.top };

	getLength() {
		return this.distance;
	};

	getHeading(){

		if ( this.currentPos.x > 0 ){
			this.heading.right = true;
		} else if ( this.currentPos.x < 0 ) {
			this.heading.left = true;
		};

		if ( this.currentPos.y > 0 ){
			this.heading.down = true;
		} else if ( this.currentPos.y < 0 ) {
			this.heading.up = true;
		};

	};

	getAngle() {

		if ( this.currentPos.x === 0 && this.currentPos.y === 0 ) {

			return this.angle = 0;

		} else if ( this.angle > 0 ) {

			this.angle -= 2 * Math.PI;
		};

		return Math.abs( this.angle );
	};	

	buildBase( id ){
		return [
			'<div class="virtualJoystick" id="joystick' + id + '" style="width: 120px; height: 120px;">',
			'<svg class="virtualJoystick-svg" width="120" height="120" viewBox="0 0 120 120">',
			'<circle class="virtualJoystick-circle" cx="60" cy="60" r="56" stroke-width="7"/>',
			'<polygon class="virtualJoystick-arrowUp" points="60 11.25 67.5 18.75 52.5 18.75 60 11.25"/>',
			'<polygon class="virtualJoystick-arrowRight" points="108.75 60 101.25 67.5 101.25 52.5 108.75 60"/>',
			'<polygon class="virtualJoystick-arrowDown" points="60 108.75 67.5 101.25 52.5 101.25 60 108.75"/>',
			'<polygon class="virtualJoystick-arrowLeft" points="11.25 60 18.75 67.5 18.75 52.5 11.25 60"/>',
			'</svg>',
			'</div>'
		].join("");		
	};

};
