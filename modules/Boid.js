if ( typeof process !== 'undefined' && process.release.name === 'node' ) {
	var Vector2 = require( '../modules/Vec2.js' );
};

class Boid {

	constructor( options ){
		
		const defaults = {
			bounds: {
				x: 0,
				y: 0,
				width: 1000,
				height: 600
			},
			edgeBehavior: 'bounce',
			mass: 1.0,
			maxSpeed: 10,
			maxForce: 1,
			radius: 0,
			arriveThreshold: 50,
			wanderDistance: 10,
			wanderRadius: 5,
			wanderAngle: 0,
			wanderRange: 1,
			avoidDistance: 300,
			avoidBuffer: 20,
			pathThreshold: 20,
			maxDistance: 300,
			minDistance: 60
		};

		function getOpt( options, key ) {
			if ( options && typeof options[key] !== 'undefined' ) {
				return options[key];
			};
			return defaults[key];
		};

		this.PI_D2 = Math.PI / 2;
		this.userData = {};

		if ( typeof process !== 'undefined' && process.release.name === 'node' ) {

			this.position = new Vector2();
			this.velocity = new Vector2();
			this.steeringForce = new Vector2();
		
		} else {

			this.position = new Vec2();
			this.velocity = new Vec2();
			this.steeringForce = new Vec2();

		};

		this.bounds = Object.assign({}, defaults.bounds, (options && options.bounds));

		this.edgeBehavior = getOpt(options, 'edgeBehavior');
		this.mass = getOpt(options, 'mass');
		this.maxSpeed = getOpt(options, 'maxSpeed');
		this.maxSpeedSq = this.maxSpeed * this.maxSpeed;
		this.maxForce = getOpt(options, 'maxForce');
		this.radius = getOpt(options, 'radius');
		// arrive
		this.arriveThreshold = getOpt(options, 'arriveThreshold');
		this.arriveThresholdSq = this.arriveThreshold * this.arriveThreshold;
		// wander
		this.wanderDistance = getOpt(options, 'wanderDistance');
		this.wanderRadius = getOpt(options, 'wanderRadius');
		this.wanderAngle = getOpt(options, 'wanderAngle');
		this.wanderRange = getOpt(options, 'wanderRange');
		// avoid
		this.avoidDistance = getOpt(options, 'avoidDistance');
		this.avoidBuffer = getOpt(options, 'avoidBuffer');
		// follow path
		this.pathIndex = 0;
		this.pathThreshold = getOpt(options, 'pathThreshold');
		this.pathThresholdSq = this.pathThreshold * this.pathThreshold;
		// flock
		this.maxDistance = getOpt(options, 'maxDistance');
		this.maxDistanceSq = this.maxDistance * this.maxDistance;
		this.minDistance = getOpt(options, 'minDistance');
		this.minDistanceSq = this.minDistance * this.minDistance;
		// edge behaviors
		this.EDGE_NONE = 'none';
		this.EDGE_BOUNCE = 'bounce';
		this.EDGE_WRAP = 'wrap';
	};

	setBounds( width, height, x, y ) {
		bounds.width = width;
		bounds.height = height;
		bounds.x = x || 0;
		bounds.y = y || 0;

		return boid;
	};

	bounce() {
		const minX = this.bounds.x + this.radius;
		const maxX = this.bounds.x + this.bounds.width - this.radius;
		if ( this.position.x > maxX ) {
			this.position.x = maxX;
			this.velocity.x *= -1;
		} else if ( this.position.x < minX ) {
			this.position.x = minX;
			this.velocity.x *= -1;
		};

		const minY = this.bounds.y + this.radius;
		const maxY = this.bounds.y + this.bounds.height - this.radius;
		if ( this.position.y > maxY ) {
			this.position.y = maxY;
			this.velocity.y *= -1;
		} else if ( this.position.y < minY ) {
			this.position.y = minY;
			this.velocity.y *= -1;
		};
	};

	wrap() {
		const minX = this.bounds.x - this.radius;
		const maxX = this.bounds.x + this.bounds.width + this.radius;
		if ( this.position.x > maxX ) {
			this.position.x = minX;
		} else if ( this.position.x < minX ) {
			this.position.x = maxX;
		};

		const minY = this.bounds.y - this.radius;
		const maxY = this.bounds.y + this.bounds.height + this.radius;
		if ( this.position.y > maxY ) {
			this.position.y = minY;
		} else if (this.position.y < minY) {
			this.position.y = maxY;
		};
	};

	seek( targetVec ) {
		const desiredVelocity = targetVec.clone().subtract(this.position);
		desiredVelocity.normalize();
		desiredVelocity.scaleBy(this.maxSpeed);

		const force = desiredVelocity.subtract(this.velocity);
		this.steeringForce.add(force);
		force.dispose();

		return this;
	};

	flee( targetVec ) {
		const desiredVelocity = targetVec.clone().subtract(this.position);
		desiredVelocity.normalize();
		desiredVelocity.scaleBy(this.maxSpeed);

		const force = desiredVelocity.subtract(this.velocity);
		this.steeringForce.subtract(force);
		force.dispose();

		return this;
	};

	// seek until within arriveThreshold
	arrive( targetVec ) {
		const desiredVelocity = targetVec.clone().subtract(this.position);
		desiredVelocity.normalize();

		const distanceSq = this.position.distanceSq(targetVec);
		if ( distanceSq > this.arriveThresholdSq ) {
			desiredVelocity.scaleBy( this.maxSpeed );
		} else {
			const scalar = this.maxSpeed * distanceSq / this.arriveThresholdSq;
			desiredVelocity.scaleBy(scalar);
		};
		const force = desiredVelocity.subtract(this.velocity);
		this.steeringForce.add( force );
		force.dispose();

		return this;
	};

	// look at velocity of boid and try to predict where it's going
	pursue( targetBoid ) {
		const lookAheadTime = this.position.distanceSq(targetBoid.position) / this.maxSpeedSq;

		const scaledVelocity = targetBoid.velocity.clone().scaleBy( lookAheadTime );
		const predictedTarget = targetBoid.position.clone().add( scaledVelocity );

		this.seek( predictedTarget );

		scaledVelocity.dispose();
		predictedTarget.dispose();

		return this;
	};

	// look at velocity of boid and try to predict where it's going
	offsetPursue( targetBoid, offset ) {
		const lookAheadTime = this.position.distanceSq(targetBoid.position) / this.maxSpeedSq;

		const scaledVelocity = targetBoid.velocity.clone().scaleBy( lookAheadTime * offset );
		const predictedTarget = targetBoid.position.clone().add( scaledVelocity );

		this.seek( predictedTarget.scaleBy( offset ) );

		scaledVelocity.dispose();
		predictedTarget.dispose();

		return this;
	};

	// look at velocity of boid and try to predict where it's going
	evade( targetBoid ) {
		const lookAheadTime = this.position.distanceSq( targetBoid.position ) / this.maxSpeedSq;

		const scaledVelocity = targetBoid.velocity.clone().scaleBy( lookAheadTime );
		const predictedTarget = targetBoid.position.clone().add( scaledVelocity );

		this.flee(predictedTarget);

		scaledVelocity.dispose();
		predictedTarget.dispose();

		return this;
	};

	// gets a bit rough used in combination with seeking as the boid attempts
	// to seek straight through an object while simultaneously trying to avoid it
	avoid( obstacles ) {
		for ( let i = 0; i < obstacles.length; i++ ) {
			const obstacle = obstacles[i];
			const heading = this.velocity.clone().normalize();

			// vec between obstacle and boid
			const difference = obstacle.position.clone().subtract( this.position );
			const dotProd = difference.dotProduct(heading);

			// if obstacle in front of boid
			if ( dotProd > 0 ) {
				// vec to represent 'feeler' arm
				const feeler = heading.clone().scaleBy( this.avoidDistance );
				// project difference onto feeler
				const projection = heading.clone().scaleBy( dotProd );
				// distance from obstacle to feeler
				const vecDistance = projection.subtract( difference );
				const distance = vecDistance.length;
				// if feeler intersects obstacle (plus buffer), and projection
				// less than feeler length, will collide
				if ( distance < (obstacle.radius || 0 ) + this.avoidBuffer && projection.length < feeler.length) {
					// calc a force +/- 90 deg from vec to circ
					const force = heading.clone().scaleBy( this.maxSpeed );
					force.angle += difference.sign( this.velocity ) * this.PI_D2;
					// scale force by distance (further = smaller force)
					const dist = projection.length / feeler.length;
					force.scaleBy( 1 - dist );
					// add to steering force
					this.steeringForce.add( force );
					// braking force - slows boid down so it has time to turn (closer = harder)
					this.velocity.scaleBy( dist );

					force.dispose();
				};

				feeler.dispose();
				projection.dispose();
				vecDistance.dispose();
			};
			heading.dispose();
			difference.dispose();
		};
		return this;
	};

	// follow a path made up of an array or vectors
	followPath( path, loop ) {
		loop = !!loop;

		const wayPoint = path[pathIndex];
		if ( !wayPoint ) {
			pathIndex = 0;
			return boid;
		};
		if ( position.distanceSq( wayPoint ) < pathThresholdSq ) {
			if ( pathIndex >= path.length - 1 ) {
				if ( loop ) {
					pathIndex = 0;
				};
			} else {
				pathIndex++;
			};
		};
		if ( pathIndex >= path.length - 1 && !loop ) {
			arrive( wayPoint );
		} else {
			seek( wayPoint );
		};
		return boid;
	};

	// is boid close enough to be in sight and facing
	inSight( b ) {
		if ( this.position.distanceSq( b.position ) > this.maxDistanceSq ) {
			return false;
		};
		const heading = this.velocity.clone().normalize();
		const difference = b.position.clone().subtract( this.position );
		const dotProd = difference.dotProduct( heading );

		heading.dispose();
		difference.dispose();

		return dotProd >= 0;
	};

	// interpose - interpose between two objects
	interpose( targetA, targetB ) {
		let midPoint = targetA.position.clone().add( targetB.position.clone() ).divideBy( 2 );
		const timeToMidPoint = this.position.distanceSq( midPoint ) / this.maxSpeedSq;
		const pointA = targetA.position.clone().add( targetA.velocity.clone().scaleBy( timeToMidPoint ) );
		const pointB = targetB.position.clone().add( targetB.velocity.clone().scaleBy( timeToMidPoint ) );
		midPoint = pointA.add( pointB ).divideBy( 2 );
		this.seek( midPoint );
		return this;
	};

	// rotate - rotate single boid by angle
	rotate( angle ) {
		this.velocity.x = Math.cos( angle );
		this.velocity.y = Math.sin( angle );
		return this;
	};

	update( delta ) {
		this.steeringForce.truncate( this.maxForce );
		if ( this.mass !== 1 ) {
			this.steeringForce.divideBy( this.mass );
		};
		// velocity.add(steeringForce);
		this.velocity.x += this.steeringForce.x;
		this.velocity.y += this.steeringForce.y;
		// steeringForce.reset();
		this.steeringForce.x = 0;
		this.steeringForce.y = 0;
		this.velocity.truncate( this.maxSpeed );
		// position.add(velocity);
		this.position.x += this.velocity.x * delta;
		this.position.y += this.velocity.y * delta;

		if ( this.edgeBehavior === this.EDGE_BOUNCE ) {
			this.bounce();
		} else if ( this.edgeBehavior === this.EDGE_WRAP ) {
			this.wrap();
		};
		return this;
	};

};

if ( typeof process !== 'undefined' && process.release.name === 'node' ) {
	module.exports = Boid;
};

