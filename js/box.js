// Set camera, scene, renderer as global variables - might need
var blockScene = new THREE.Scene();
var mapScene = new THREE.Scene();
var xSectionScene = new THREE.Scene();
var scenes = [], renderer, canvas;


// Define beds
var bedThickness = .25
var numberOfBeds = 10
var strike = 60
var dip = 30

// var a = new THREE.Vector3(),
//   b = new THREE.Vector3(),
//   c = new THREE.Vector3();
// var planePointA = new THREE.Vector3(),
//   planePointB = new THREE.Vector3(),
//   planePointC = new THREE.Vector3();
// var lineAB = new THREE.Line3(),
//   lineBC = new THREE.Line3(),
//   lineCA = new THREE.Line3();


// Define cube of clipping planes for block diagram
var clipPlanes = [
  new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, 1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, 1 ), 1 )
];

var xAxisBoundingLines = [],
  yAxisBoundingLines = [],
  zAxisBoundingLines = [];

// Make group to put beds in
var group = new THREE.Object3D();

// Make beds
for (var i = 0; i < numberOfBeds; i++) {
  var geometry = new THREE.BoxGeometry(4, bedThickness, 4)
  var material = new THREE.MeshPhongMaterial({
          color: new THREE.Color( Math.sin( i * 0.5 ) * 0.5 + 0.5, Math.cos( i * 1.5 ) * 0.5 + 0.5, Math.sin( i * 4.5 + 0 ) * 0.5 + 0.5 ),
          // side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
          clipIntersection: false})
  var bed = new THREE.Mesh( geometry, material );
  bed.position.y = -1*numberOfBeds*bedThickness/2 + bedThickness*i
  group.add( bed )
}


// // Create an event listener that resizes the renderer with the browser window.
// window.addEventListener('resize', function() {
//   var WIDTH = window.innerWidth,
//       HEIGHT = window.innerHeight;
//   renderer.setSize(WIDTH, HEIGHT);
//   camera.aspect = WIDTH / HEIGHT;
//   camera.updateProjectionMatrix();
// });

init();
animate();

function init () {
  canvas = document.getElementById( "c" );

  var template = document.getElementById( "template" ).text;
  var content = document.getElementById( "content" );

  // Strike
  group.rotation.y = Math.PI/180 * strike
  //Dip
  group.rotation.x = Math.PI/180 * dip
  group.rotation.order = "YXZ"

  makeSides()

  // Create a light, set its position, and add it to the scene.
  var light1 = new THREE.PointLight(0xffffff, 1, 0, 2);
  light1.position.set(-100,200,100);

  var light2 = new THREE.PointLight(0xffffff, 0.25, 0, 2);
  light2.position.set(100,200,100);

  var light3 = new THREE.PointLight(0xffffff, 0.25, 0, 2);
  light3.position.set(100,-100,-100);




  // ADD BLOCK SCENE TO DOM

  //Add a list item to the DOM
  var element = document.createElement( "div" );
  element.className = "list-item";
  element.innerHTML = template.replace( '$', "Block Diagram" );
  // Look up the element that represents the area
  // we want to render the scene
  blockScene.userData.element = element.querySelector( ".scene" );
  debugger
  content.appendChild( element );

  // Move camera away from box
  orbitCamera = new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 1000 );

  orbitCamera.position.x = 2;
  orbitCamera.position.y = 2;
  orbitCamera.position.z = 5;

  orbitCamera.lookAt( blockScene.position );
  blockScene.userData.camera = orbitCamera
  var controls = new THREE.OrbitControls( blockScene.userData.camera, blockScene.userData.element );
  blockScene.userData.controls = controls;

  blockScene.add( group )
  blockScene.add( light1 )
  blockScene.add( light2 )
  blockScene.add( light3 )
  scenes.push(blockScene)

  // ADD Cross Section TO DOM
  // var element = document.createElement( "div" );
  // element.className = "list-item";
  // element.innerHTML = template.replace( '$', "Cross Section" );
  // // Look up the element that represents the area
  // // we want to render the scene
  // xSectionScene.userData.element = element.querySelector( ".scene" );
  // content.appendChild( element );
  //
  // // position camera
  // xSectionCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, -500, 1000  );
  // console.log(window.innerWidth/-2000)
  // xSectionCamera.position.z = 5;
  //
  // xSectionCamera.lookAt( xSectionScene.position );
  // xSectionScene.userData.camera = xSectionCamera
  //
  // xSectionScene.add( group )
  // xSectionScene.add( light1 )
  // xSectionScene.add( light2 )
  // xSectionScene.add( light3 )
  // scenes.push(xSectionScene)
  //
  // // ADD Map View TO DOM
  // var element = document.createElement( "div" );
  // element.className = "list-item";
  // element.innerHTML = template.replace( '$', "Map View" );
  // // Look up the element that represents the area
  // // we want to render the scene
  // mapScene.userData.element = element.querySelector( ".scene" );
  // content.appendChild( element );
  //
  // // Position Camera
  // mapCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, -500, 1000  );
  // console.log(window.innerWidth/-2000)
  // mapCamera.position.y = 5;
  //
  // mapCamera.lookAt( mapScene.position );
  // mapScene.userData.camera = mapCamera
  //
  // mapScene.add( group )
  // mapScene.add( light1 )
  // mapScene.add( light2 )
  // mapScene.add( light3 )
  // scenes.push(mapScene)
  // //
  // // render the secene in HTML and insert it into the DOM
  // // renderer.setSize( window.innerWidth, window.innerHeight );
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true });
  renderer.setClearColor( 0x222222 );
  renderer.localClippingEnabled = true;

  document.body.appendChild( renderer.domElement );

  // Add OrbitControls so that we can pan around with the mouse.
  // controls = new THREE.OrbitControls(orbitCamera, renderer.domElement);
}

function animate() {
  requestAnimationFrame( animate );
  render();
  // renderer.render( scene, orbitCamera );
}

function render() {
  updateSize();
  renderer.setClearColor( 0xffffff );
  renderer.setScissorTest( false );
  renderer.clear();
  renderer.setClearColor( 0xe0e0e0 );
  renderer.setScissorTest( true );
  scenes.forEach( function( scene ) {
    // so something moves
    // scene.children[0].rotation.y = Date.now() * 0.001;
    // get the element that is a place holder for where we want to
    // draw the scene
    var element = scene.userData.element;
    // get its position relative to the page's viewport
    var rect = element.getBoundingClientRect();
    // check if it's offscreen. If so skip it
    if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight ||
       rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {
      return;  // it's off screen
    }
    // set the viewport
    var width  = rect.right - rect.left;
    var height = rect.bottom - rect.top;
    var left   = rect.left;
    var top    = rect.top;
    renderer.setViewport( left, top, width, height );
    renderer.setScissor( left, top, width, height );
    var camera = scene.userData.camera;
    if (camera.isOrthographicCamera) {
      debugger
    }
    //camera.aspect = width / height; // not changing in this example
    //camera.updateProjectionMatrix();
    //scene.userData.controls.update();
    renderer.render( scene, camera );
  } );
}

function updateSize() {
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  if ( canvas.width !== width || canvas.height != height ) {
    renderer.setSize( width, height, false );
  }
}

function generateClipVertices() {
  var clipVertices = new THREE.Geometry()
  for (var i = -1; i < 2; i += 2) {
    for (var j = -1; j < 2; j += 2) {
      for (var k = -1; k < 2; k += 2) {
        var n = new THREE.Vector3(i,j,k)
        clipVertices.vertices.push(n.clone())
      }
    }
  }
  return clipVertices
}

function makeLinesFromVertices() {
  var clipVertices = generateClipVertices()
  var vertices = clipVertices.vertices;
  for (var i = 0; i < vertices.length; i++) {
    for (var j = i+1; j < vertices.length; j++) {
      if (vertices[i].x == vertices[j].x && vertices[i].y == vertices[j].y) {
        zAxisBoundingLines.push(new THREE.Line3(vertices[i],vertices[j]))
      } else if (vertices[i].x == vertices[j].x && vertices[i].z == vertices[j].z) {
        yAxisBoundingLines.push(new THREE.Line3(vertices[i],vertices[j]))
      } else if (vertices[i].y == vertices[j].y && vertices[i].z == vertices[j].z) {
        xAxisBoundingLines.push(new THREE.Line3(vertices[i],vertices[j]))
      }
    }
  }
}


function makeSides() {
  var sidesGroup = new THREE.Object3D();
  makeLinesFromVertices();
  //Loop through each bed
  for (var i = 0; i < group.children.length; i++) {
    //Set variables
    var bed = group.children[i];
    var topPlane = planeFromObject(bed, 4); //5 also a top face
    var bottomPlane = planeFromObject(bed, 6); //7 also a bottom face.
    var topPointsIndexArray = []
    var bottomPointsIndexArray = []
    var sidesRing = new THREE.Geometry()
    //Gather points of intersection
    for (var j = 0; j < yAxisBoundingLines.length; j++) {
      var verticalSides = new THREE.Geometry();
      var topPointOfIntersection = topPlane.intersectLine(yAxisBoundingLines[j]);
      var bottomPointOfIntersection = bottomPlane.intersectLine(yAxisBoundingLines[j]);

      if (topPointOfIntersection) {
        var index = sidesRing.vertices.push(topPointOfIntersection.clone()) - 1;//for some indecipherable reason, when you push to vertices, the function returns the index, plus one.
        topPointsIndexArray.push(index)
      };
      if (bottomPointOfIntersection) {
        var index = sidesRing.vertices.push(bottomPointOfIntersection.clone())-1;//for some indecipherable reason, when you push to vertices, the function returns the index, plus one.
        bottomPointsIndexArray.push(index)
      };
    }
    // loop through comparing vertices and make sides
    if (topPointsIndexArray.length == 4 && bottomPointsIndexArray.length == 4) {
      for (var j = 0; j < topPointsIndexArray.length; j++) {
        for (var k = j + 1; k < topPointsIndexArray.length; k++) {
          if ((sidesRing.vertices[topPointsIndexArray[j]].x == sidesRing.vertices[topPointsIndexArray[k]].x) || (sidesRing.vertices[topPointsIndexArray[j]].z == sidesRing.vertices[topPointsIndexArray[k]].z) ) { // if two point are adjacent
            var face1 = new THREE.Face3( sidesRing.vertices[topPointsIndexArray[j]], sidesRing.vertices[topPointsIndexArray[k]], sidesRing.vertices[bottomPointsIndexArray[j]] ) // make face with two points on the top
            var face2 = new THREE.Face3( sidesRing.vertices[bottomPointsIndexArray[j]], sidesRing.vertices[bottomPointsIndexArray[k]], sidesRing.vertices[topPointsIndexArray[k]] )  // make face with two points on the bottom
            sidesRing.faces.push(face1)
            sidesRing.faces.push(face2)
          }
        }
      }
    }
    if (sidesRing.faces) {
      ring = new THREE.Mesh( sidesRing, group.children[i].material );
      sidesGroup.add(ring)
    }
  }
  group.add(ring)
}

function planeFromObject(object, faceNumber) {
  var objectPointA = new THREE.Vector3(),
    objectPointB = new THREE.Vector3(),
    objectPointC = new THREE.Vector3();

  var mathPlane = new THREE.Plane();
  object.localToWorld(objectPointA.copy(object.geometry.vertices[object.geometry.faces[faceNumber].a]));
  object.localToWorld(objectPointB.copy(object.geometry.vertices[object.geometry.faces[faceNumber].b]));
  object.localToWorld(objectPointC.copy(object.geometry.vertices[object.geometry.faces[faceNumber].c]));
  mathPlane.setFromCoplanarPoints(objectPointA, objectPointB, objectPointC);
  return mathPlane
}

// GUI
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
