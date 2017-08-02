var strike = 60
var dip = 30

var bedThickness = .25
var numberOfBeds = 10

var container
var views, scene, renderer;
var mesh, group, light;
var windowWidth, windowHeight;
var views = [
  {
    left: 0,
    top: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color("#3d3d3d"),
    camera: new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 1000 ),
    cameraPosition: [ 2, 2, 5 ]
  },
  {
    left: 0.5,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color("#3d3d3d"),
    camera: new THREE.OrthographicCamera( -2, 2, 2, -2, -500, 1000 ),
    cameraPosition: [ 0, 0, 5 ]
  },
  {
    left: 0.5,
    top: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color("#3d3d3d"),
    camera: new THREE.OrthographicCamera( -2, 2, 2, -2, -500, 1000 ),
    cameraPosition: [ 0, 5, 0 ]
  }
];

var clipPlanes = [
  new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, 1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, 1 ), 1 )
];

var group = new THREE.Object3D();

// Make beds
for (var i = 0; i < numberOfBeds; i++) {
  var geometry = new THREE.BoxGeometry(4, bedThickness, 4)
  var material = new THREE.MeshPhongMaterial({
          color: new THREE.Color( Math.sin( i * 0.5 ) * 0.5 + 0.5, Math.cos( i * 1.5 ) * 0.5 + 0.5, Math.sin( i * 4.5 + 0 ) * 0.5 + 0.5 ),
          clippingPlanes: clipPlanes,
          clipIntersection: false
        })

  var bed = new THREE.Mesh( geometry, material );
  bed.position.y = -1*numberOfBeds*bedThickness/2 + bedThickness*i
  group.add( bed )
}

init();
animate();
function init() {
  container = document.getElementById( 'container' );

  scene = new THREE.Scene();

  var ambientLight = new THREE.AmbientLight()
  var light1 = new THREE.PointLight(0xffffff, 1, 0, 2);
  light1.position.set(-100,200,100);

  scene.add( ambientLight, light1 )

  for (var ii =  0; ii < views.length; ++ii ) {
    var view = views[ii];
    var camera = view.camera
    camera.position.fromArray( view.cameraPosition );
    camera.lookAt(scene.position)
    view.camera = camera
  }


  var canvas = document.createElement( 'canvas' );
  canvas.width = 128;
  canvas.height = 128;
  var context = canvas.getContext( '2d' );

  var materials = [
    new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
    new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
  ];
  // Strike
  group.rotation.y = Math.PI/180 * strike
  //Dip
  group.rotation.x = Math.PI/180 * dip
  group.rotation.order = "YXZ"
  scene.add(group)

  renderer = new THREE.WebGLRenderer( { antialias: true, localClippingEnabled: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  var text1 = document.createElement('div');
  text1.style.position = 'absolute';
  //text1.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  text1.style.width = 100;
  text1.style.height = 100;
  text1.style.color = "white";
  text1.innerHTML = "Block Diagram";
  text1.style.top = '12%';
  text1.style.left = '20%';
  document.body.appendChild(text1);

  var text2 = document.createElement('div');
  text2.style.position = 'absolute';
  //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  text2.style.width = 100;
  text2.style.height = 100;
  text2.style.color = "white";
  text2.innerHTML = "Map View";
  text2.style.top = '8%';
  text2.style.left = '72%';
  document.body.appendChild(text2);

  var text3 = document.createElement('div');
  text3.style.position = 'absolute';
  //text3.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  text3.style.width = 100;
  text3.style.height = 100;
  text3.style.color = "white";
  text3.innerHTML = "Cross Section";
  text3.style.top = '58%';
  text3.style.left = '72%';
  document.body.appendChild(text3);
}
function updateSize() {
  if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
    windowWidth  = window.innerWidth;
    windowHeight = window.innerHeight;
    renderer.setSize ( windowWidth, windowHeight );
  }
}
function animate() {
  render();
  requestAnimationFrame( animate );
}
function render() {
  updateSize();
  for ( var ii = 0; ii < views.length; ++ii ) {
    var view = views[ii];
    var camera = view.camera;
    // if (camera.type == "PerspectiveCamera") {
    // 	var controls = new THREE.OrbitControls(camera);
    // 	scene.userData.controls = controls;
    // }
    var left   = Math.floor( windowWidth  * view.left );
    var top    = Math.floor( windowHeight * view.top );
    var width  = Math.floor( windowWidth  * view.width );
    var height = Math.floor( windowHeight * view.height );
    renderer.setViewport( left, top, width, height );
    renderer.setScissor( left, top, width, height );
    renderer.setScissorTest( true );
    renderer.setClearColor( view.background );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.localClippingEnabled = true;
    renderer.render( scene, camera );
  }
}

var gui = new dat.GUI(),
  folderLocal = gui.addFolder( 'Strike and Dip' )
  props = {
            get 'Strike'() { return group.rotation.y*180/Math.PI; },
            set 'Strike'( v ) { group.rotation.y = v*Math.PI/180},

            get 'Dip'() { return group.rotation.x*180/Math.PI; },
            set 'Dip'( v ) { group.rotation.x = v*Math.PI/180 }
          };

  folderLocal.add( props, 'Strike', 0, 360 );
  folderLocal.add( props, 'Dip', 0, 90 );
