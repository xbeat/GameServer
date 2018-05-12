
class Scene3D{

	constructor(){

		this.maxPlayers = 18;
		this.mixer = new Array();
		this.clock = new THREE.Clock();
		this.players = new Array();
		this.playerSelected = 0;
		this.playerIndex = 0

		this.scene = new THREE.Scene();
		this.scene.add ( new THREE.AmbientLight( 0xffffff ) );

		this.lightOffset = new THREE.Vector3( 0, 1000, 1000.0 ); 
		this.light = new THREE.DirectionalLight( 0x888888, 1 );
		this.light.position.copy( this.lightOffset );
		this.light.castShadow = true;
		this.light.shadow.mapSize.width = 2048;
		this.light.shadow.mapSize.height = 2048;
		this.light.shadow.camera.near = 10;
		this.light.shadow.camera.far = 10000;
		this.light.shadow.bias = 0.00001;
		this.light.shadow.camera.right = 3200;
		this.light.shadow.camera.left = -3400;
		this.light.shadow.camera.top = 1500;
		this.light.shadow.camera.bottom = -2500;
		this.scene.add( this.light );

		//let helper = new THREE.CameraHelper( light.shadow.camera );
		//this.scene.add( helper );

		this.scene.add( this.light );
		
		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		let aspect = window.innerWidth / window.innerHeight;
		//let radius = player.geometry.boundingSphere.radius;
		let radius = 60;

		this.camera = new THREE.PerspectiveCamera( 45, aspect, 1, 20000 );
		this.camera.position.set( 0.0, radius * 6, radius * 6.5 );

		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		this.controls.target.set( 0, radius, 0 );
		this.controls.enabled = true;
		//this.controls.enablePan = true;	
					
		let ctx = this.renderer.context;
		ctx.getShaderInfoLog = function () { return '' };

		document.body.appendChild( this.renderer.domElement );

		// ------------- load Player -------------
		let url = 'models/player/Player.json';
		let scope = this;
		this.player;

		new THREE.ObjectLoader().load( url, function ( loadedObject ) {
			loadedObject.traverse( function ( child ) {
				if ( child instanceof THREE.SkinnedMesh ) {
					scope.player = child;
				};
				
			} );

			if ( scope.player === undefined ) {
				alert( 'Unable to find a Player Model in this place:\n\n' + url + '\n\n' );
				return;
			};

			// golabl method & start rendering
			g_SoccerPitch = new SoccerPitch( scope );
			ball = g_SoccerPitch.m_pBall;
			red = g_SoccerPitch.m_pRedTeam;
			blue = g_SoccerPitch.m_pBlueTeam;

			step();

		});
		
		//  ------------ Pitch ----------------			
		new THREE.ObjectLoader().load( "models/pitch/stadium.json", function( pitch ) {
			
			pitch.position.set( -50, -30, -100 );
			pitch.scale.set( 800, 800, 800 );
			scope.scene.add( pitch );
			scope.pitch = pitch;

		});

		// --------- Create Sky Scene -----------
		let path = "models/skyscene/";
		let format = '.jpg';
		let urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		 ];

		let textureLoader = new THREE.CubeTextureLoader();
		let textureCube = textureLoader.load(urls);

		let shader = THREE.ShaderLib["cube"];
		shader.uniforms["tCube"].value = textureCube;

		// We're inside the box, so make sure to render the backsides
		// It will typically be rendered first in the scene and without depth so anything else will be drawn in front
		let material = new THREE.ShaderMaterial( {
			fragmentShader : shader.fragmentShader,
			vertexShader   : shader.vertexShader,
			uniforms       : shader.uniforms,
			depthWrite     : false,
			side           : THREE.BackSide
		} );

		// The box dimension size doesn't matter that much when the camera is in the center.  Experiment with the values.
		let skyMesh = new THREE.Mesh( new THREE.CubeGeometry( 7300, 7300, 7300, 1, 1, 1 ), material );
		//skyMesh.renderDepth = -10;
		skyMesh.position.set( 0, -500, 0)
		this.scene.add( skyMesh );
		
		// --------- Soccer Ball ----------		
     	let buffgeoSphere = new THREE.BufferGeometry();
        buffgeoSphere.fromGeometry( new THREE.SphereGeometry( 1, 20, 10 ) );
	    let ballTexture = new THREE.TextureLoader().load( 'models/ball/ball.png' );			        
        var ballMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff, 
            map: ballTexture
        });
        
        this.ball3D = new THREE.Mesh( buffgeoSphere, ballMaterial );
        
        this.ball3D.castShadow = true;
		//ball[i].receiveShadow = true;
		this.scene.add( this.ball3D );
		this.ball3D.scale.set( 6, 6, 6 );
		this.ball3D.position.set( 0, 5, 0 );

		//------------ Ring -------------
		let ringGeom = new THREE.RingGeometry( 30, 70, 32 );
		let ringMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 } );

		this.ring = new THREE.Mesh( ringGeom, ringMaterial );
		this.ring.name = 'ring';
		this.ring.position.set( 0, 1, 0 );
		this.ring.rotation.x = -0.5 * Math.PI;

		this.scene.add( this.ring );

	};

	// add player
	addPlayer(){

		let scope = this;

		// Add player and skeleton helper to scene
		this.players[ this.playerIndex ] = this.player.clone();
		
		this.player.traverse( function ( child ) {
			if ( child instanceof THREE.SkinnedMesh ) { 
				scope.players[ scope.playerIndex ].material = child.material.clone(); 
			};
		} );
		
		this.players[ this.playerIndex ].castShadow = true;

		this.scene.add( this.players[ this.playerIndex ] );

		// Add Uniform
		if ( this.playerIndex < ( this.maxPlayers / 2 ) - 1 ){
		
			//https://stackoverflow.com/questions/11919694/how-to-clone-an-object3d-in-three-js
			this.players[ this.playerIndex ].material.map = new THREE.TextureLoader().load( 'models/player/BodyDressed_UnitedUniformRed.png' );
		
		};

		// Initialize mixer and clip actions
		this.mixer[ this.playerIndex ] = new THREE.AnimationMixer( this.players[ this.playerIndex ] );

		this.mixer[ this.playerIndex ].clipAction( 'idle' ).play();
		this.mixer[ this.playerIndex ].clipAction( 'walk' ).play();
		this.mixer[ this.playerIndex ].clipAction( 'run' ).play();

		this.playerIndex++;

	};

	convertRange( value ) {
		//https://stackoverflow.com/questions/14224535/scaling-between-two-number-ranges
		//https://stats.stackexchange.com/questions/178626/how-to-normalize-data-between-1-and-1/332414#332414

		// Get the real pitch size
		const pitchSize = new THREE.Box3().setFromObject( this.pitch );
		//console.log( bbox );
		const pitchBorder = 1000;

		const rangeMinFrom = {
				x: 0,
				y: 0
			},

			rangeMaxFrom = {
				x: cxClient,
				y: cyClient
			},

			rangeMinTo = {
				x: pitchSize.min.x + pitchBorder,
				y: pitchSize.min.z + pitchBorder
			},

			rangeMaxTo = {
				x: pitchSize.max.x - pitchBorder,
				y: pitchSize.max.z - pitchBorder
			};

    	return {
    		x: ( value.x - rangeMinFrom.x ) * ( rangeMaxTo.x - rangeMinTo.x ) / ( rangeMaxFrom.x - rangeMinFrom.x ) + rangeMinTo.x,
    		y: ( value.y - rangeMinFrom.y ) * ( rangeMaxTo.y - rangeMinTo.y ) / ( rangeMaxFrom.y - rangeMinFrom.y ) + rangeMinTo.y
    	};
	
	};

	// render
 	Render() {

		// Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
		let mixerUpdateDelta = this.clock.getDelta();

		// Update the animation mixer, and render this frame
		for ( let i = 0; i < this.maxPlayers; i++ ){ 
			this.mixer[ i ].update( mixerUpdateDelta );
		};
		
		if ( this.followObject ){
			this.camera.lookAt( this.ball3D.position );
        } else {
			//this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
			//this.camera.lookAt( this.CameraLookAt );
        };

		this.renderer.render( this.scene, this.camera );

	};

};
