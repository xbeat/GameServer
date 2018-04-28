class Vec2{

	constructor( x = 0, y = 0 ) {
		this.x = x;
		this.y = y;
		this.pool = [];
	};

	add( vec ) {
		this.x = this.x + vec.x;
		this.y = this.y + vec.y;
		return this;
	};

	subtract( vec ) {
		this.x = this.x - vec.x;
		this.y = this.y - vec.y;
		return this;
	};

	normalize() {
		let lsq = this.lengthSquared;
		if (lsq === 0) {
			this.x = 1;
			return this;
		};
		if (lsq === 1) {
			return this;
		};
		var l = Math.sqrt( lsq );
		this.x /= l;
		this.y /= l;
		return this;
	};

	isNormalized() {
		return this.lengthSquared === 1;
	};

	truncate( max ) {
		// if (this.length > max) {
		if (this.lengthSquared > max * max) {
			this.length = max;
		}
		return this;
	};

	scaleBy( mul ) {
		this.x *= mul;
		this.y *= mul;
		return this;
	};

	divideBy( div ) {
		this.x /= div;
		this.y /= div;
		return this;
	};

	equals( vec ) {
		return this.x === vec.x && this.y === vec.y;
	};

	negate() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	};

	dotProduct( vec ) {
		/*
		If A and B are perpendicular (at 90 degrees to each other), the result
		of the dot product will be zero, because cos(Θ) will be zero.
		If the angle between A and B are less than 90 degrees, the dot product
		will be positive (greater than zero), as cos(Θ) will be positive, and
		the vector lengths are always positive values.
		If the angle between A and B are greater than 90 degrees, the dot
		product will be negative (less than zero), as cos(Θ) will be negative,
		and the vector lengths are always positive values
		*/
		return this.x * vec.x + this.y * vec.y;
	};

	crossProduct( vec ) {
		/*
		The sign tells us if vec to the left (-) or the right (+) of this vec
		*/
		return this.x * vec.y - this.y * vec.x;
	};

	distanceSq( vec ) {
		var dx = vec.x - this.x;
		var dy = vec.y - this.y;
		return dx * dx + dy * dy;
	};

	distance( vec ) {
		return Math.sqrt( this.distanceSq( vec ) );
	};

	clone() {
		return this.get( this.x, this.y );
	};

	reset() {
		this.x = 0;
		this.y = 0;
		return this;
	};

	copy( vec ) {
		this.x = vec.x;
		this.y = vec.y;
		return this;
	};

	perpendicular() {
		return this.get( -this.y, this.x );
	};

	sign( vec ) {
		// Determines if a given vector is to the right or left of this vector.
		// If to the left, returns -1. If to the right, +1.
		var p = this.perpendicular();
		var s = p.dotProduct( vec ) < 0 ? -1 : 1;
		p.dispose();
		return s;
	};

	set( angle, length ) {
		this.x = Math.cos( angle ) * length;
		this.y = Math.sin( angle ) * length;
		return this;
	};

	dispose() {
		this.x = 0;
		this.y = 0;
		this.pool.push( this );
	};

	get( x, y ) {
		var v = this.pool.length > 0 ? this.pool.pop() : new Vec2();
		v.x = x || 0;
		v.y = y || 0;
		return v;
	};

	fill( n ) {
		while (pool.length < n) {
			thus.pool.push(new Vec2());
		};
	};

	angleBetween( a, b ) {
		if (!a.isNormalized()) {
			a = a.clone().normalize();
		};
		if (!b.isNormalized()) {
			b = b.clone().normalize();
		};
		return Math.acos(a.dotProduct(b));
	};

	distSquared( v, w ) { 
		return Math.pow( ( v.x - w.x ), 2 ) + Math.pow( ( v.y - w.y ), 2 ); 
	};

	// distante from point to segment
	distToSegmentSquared( v, w, p ) {
		var l2 = this.distSquared(v, w);
		if ( l2 == 0 ) return this.distSquared(p, v); // start == end
		var t = ( ( p.x - v.x ) * ( w.x - v.x ) + ( p.y - v.y ) * ( w.y - v.y ) ) / l2;  // unit vector from start to end 
		t = Math.max( 0, Math.min( 1, t ) ); // < 0 || > 1 not lie on the line
		return this.distSquared( p, { //distance squared p to p on the line
			x: v.x + t * ( w.x - v.x ), // point x
			y: v.y + t * ( w.y - v.y )  // point y
		} );
	};

	distToSegment( v, w, p ) { 
		return Math.sqrt( Physics.distToSegmentSquared( v, w, p ) ); 
	};

	get lengthSquared() {
		return this.x * this.x + this.y * this.y;
	};

	get length() {
		return Math.sqrt( this.lengthSquared );
	};

	set length( value ) {
		var a = this.angle;
		this.x = Math.cos(a) * value;
		this.y = Math.sin(a) * value;
	};

	get angle() {
		return Math.atan2( this.y, this.x );
	};

	set angle( value ) {
		var l = this.length;
		this.x = Math.cos( value ) * l;
		this.y = Math.sin( value ) * l;
	};

};

if ( typeof process !== 'undefined' && process.release.name === 'node' ) {
	module.exports = Vec2;
};