// Set camera, scene, renderer as global variables - might need
var scene = new THREE.Scene();
// Define beds
var bedThickness = .25
var numberOfBeds = 10
var strike = 120
var dip = 45

var a = new THREE.Vector3(),
  b = new THREE.Vector3(),
  c = new THREE.Vector3();
var planePointA = new THREE.Vector3(),
  planePointB = new THREE.Vector3(),
  planePointC = new THREE.Vector3();
var lineAB = new THREE.Line3(),
  lineBC = new THREE.Line3(),
  lineCA = new THREE.Line3();


// Define cube of clipping planes for block diagram
var clipPlanes = [
  new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0, 1,  0 ), 1 ),
  new THREE.Plane( new THREE.Vector3( 0,  0, 1 ), 1 )
];

var xAxisBoundingLines = [];
var yAxisBoundingLines = [];
var zAxisBoundingLines = [];

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


// Create an event listener that resizes the renderer with the browser window.
window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH*2/3, HEIGHT*2/3);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});

init();
animate();

function init () {
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
  group.rotation.y = Math.PI/180 * strike

  //Dip
  group.rotation.x = Math.PI/180 * dip

  group.rotation.order = "YXZ"
  scene.add( group );

  makeSides()

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

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
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
  scene.add(ring)
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
