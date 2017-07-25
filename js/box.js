// Set camera, scene, renderer as global variables - might need 
var camera, scene, renderer;
// Define beds
var bedThickness = .25
var numberOfBeds = 12

// Define cube of clipping planes for block diagram
var clipPlanes = [
  new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, 1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, 1 ), 1 )
];

// Make group to put beds in
var group = new THREE.Object3D();

// Make beds
for (var i = 0; i < numberOfBeds; i++) {
  var geometry = new THREE.BoxGeometry(3, bedThickness, 3)
  var material = new THREE.MeshPhongMaterial({
          color: new THREE.Color( Math.sin( i * 0.5 ) * 0.5 + 0.5, Math.cos( i * 1.5 ) * 0.5 + 0.5, Math.sin( i * 4.5 + 0 ) * 0.5 + 0.5 ),
          // side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
          clipIntersection: false})
  var bed = new THREE.Mesh( geometry, material );
  bed.position.y = -1*numberOfBeds*bedThickness/2 + bedThickness*i
  group.add( bed )
}


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

  // Strike
  group.rotation.y = Math.PI/180 * 45
  //Dip
  group.rotation.x = Math.PI/180 * 10

  group.rotation.order = "YXZ"
  scene.add( group );

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
