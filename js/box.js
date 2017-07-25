var camera, scene, renderer;
var geometry = new THREE.BoxGeometry(1,2,0.25)
var geometry2 = new THREE.BoxGeometry(1,2,0.25)

// Create an event listener that resizes the renderer with the browser window.
window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});

init();
animate();

function init () {
  // Set up a scene as a global variable
  scene = new THREE.Scene();

  // Move camera away from box
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  camera.position.z = 4;
  camera.position.y = 1;

  // render the secene in HTML and insert it into the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.antialias = true;
  renderer.setClearColor( 0x222222 );
  renderer.localClippingEnabled = true;

  document.body.appendChild( renderer.domElement );

  // Set the background color of the scene.
  // renderer.setClearColorHex(0x333F47, 1);

  // Create a light, set its position, and add it to the scene.
  var light = new THREE.PointLight(0xffffff, 1, 0, 2);
  light.position.set(-100,200,100);
  scene.add(light);

  var light2 = new THREE.PointLight(0xffffff, 0.25, 0, 2);
  light2.position.set(100,200,100);
  scene.add(light2);

  var light3 = new THREE.PointLight(0xffffff, 0.25, 0, 2);
  light3.position.set(100,-100,-100);
  scene.add(light3);

  var clipPlanes = [
    new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 0 ),
    new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 0 ),
    new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 0 )
  ];

  // Make box and mesh to cover it
  var material = new THREE.MeshLambertMaterial({color: 0x55B663,
            side: THREE.DoubleSide,
						clippingPlanes: clipPlanes,
						clipIntersection: true})
  var bed = new THREE.Mesh( geometry, material );

  // Not sure if this should be a global variable
  // var group = new THREE.Object3D();
  // group.add( bed )

  // Make clipping planes
  var clipPlanes = [
    new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 1 ),
    // new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 1 ),
    // new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 1 ),
    // new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), -1 ),
    // new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), -1 ),
    // new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), -1 )
  ];

  // Strike
  bed.rotation.y = Math.PI/180 * 45
  //Dip
  bed.rotation.x = Math.PI/180 * 80

  bed.rotation.order = "YXZ"
  scene.add( bed );

  // Add OrbitControls so that we can pan around with the mouse. 
  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame( animate );

  renderer.render( scene, camera );
}


// from three.js clipping advanced
function planesFromMesh( vertices, indices ) {
  // creates a clipping volume from a convex triangular mesh
  // specified by the arrays 'vertices' and 'indices'
  var n = indices.length / 3,
    result = new Array( n );
  for ( var i = 0, j = 0; i < n; ++ i, j += 3 ) {
    var a = vertices[ indices[   j   ] ],
      b = vertices[ indices[ j + 1 ] ],
      c = vertices[ indices[ j + 2 ] ];
    result[ i ] = new THREE.Plane().
        setFromCoplanarPoints( a, b, c );
  }
  return result;
}
