// Set camera, scene, renderer as global variables - might need 
var camera, scene, renderer;
// Define beds
var bedThickness = .25
var numberOfBeds = 10


// define variables for points of intersection calculations
var pointsOfIntersection = new THREE.Geometry();

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
  group.rotation.y = Math.PI/180 * 20

  //Dip
  group.rotation.x = Math.PI/180 * 80

  group.rotation.order = "YXZ"
  scene.add( group );

  // for (var i = 0; i < group.children.length; i++) {
  //   var object = group.children[i];
  //   for (var j = 0; j < clipPlanes.length; j++) {
  //     var plane = clipPlanes[j];
  //     drawIntersectionPoints(object, plane)
  //   }
  // }

  // Add OrbitControls so that we can pan around with the mouse. 
  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame( animate );

  renderer.render( scene, camera );
}

// drawClipVertices()
// function drawClipVertices() {
//   var clipVertices = generateClipVertices()

//   var pointsMaterial = new THREE.PointsMaterial({
//     size: .05,
//     color: 0xffff00
//     // color: object.material.color
//   });

//   var points = new THREE.Points(clipVertices, pointsMaterial);
//   console.log(points)
//   scene.add(points);
// }

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
  var lines = []
  var clipVertices = generateClipVertices()
  var vertices = clipVertices.vertices
  for (var i = 0; i < vertices.length; i++) {
    for (var j = i+1; j < vertices.length; j++) {
      if ((vertices[i].x == vertices[j].x && vertices[i].y == vertices[j].y) || ( vertices[i].x == vertices[j].x && vertices[i].z == vertices[j].z) || ( vertices[i].y == vertices[j].y && vertices[i].z == vertices[j].z)) {
        lines.push(new THREE.Line3(vertices[i],vertices[j]))
      } 
    }
  }
  return lines
}
findIntersectionPoints()
function findIntersectionPoints() {
  lines = makeLinesFromVertices()
  for (var i = 0; i < group.children.length; i++) {
    var bed = group.children[i];
    bed.geometry.faces[1]
    
  }
  // for (var i = 0; i < lines.length; i++) {
  //   var element = array[i];
    
  // }
}


// function drawIntersectionPoints(object, plane) {
//   object.geometry.faces.forEach(function(face) {
//     object.localToWorld(a.copy(object.geometry.vertices[face.a]));
//     object.localToWorld(b.copy(object.geometry.vertices[face.b]));
//     object.localToWorld(c.copy(object.geometry.vertices[face.c]));
//     lineAB = new THREE.Line3(a, b);
//     lineBC = new THREE.Line3(b, c);
//     lineCA = new THREE.Line3(c, a);
//     setPointOfIntersection(lineAB, plane);
//     setPointOfIntersection(lineBC, plane);
//     setPointOfIntersection(lineCA, plane);
//   });

//   var pointsMaterial = new THREE.PointsMaterial({
//     size: .05,
//     color: 0xffff00
//     // color: object.material.color
//   });

//   var points = new THREE.Points(pointsOfIntersection, pointsMaterial);
//   scene.add(points);

//   var lines = new THREE.LineSegments(pointsOfIntersection, new THREE.LineBasicMaterial({
//     color: 0xffffff
//   }));
//   scene.add(lines);
// }

function setPointOfIntersection(line, plane) {
  pointOfIntersection = plane.intersectLine(line);
  if (pointOfIntersection) {
    pointsOfIntersection.vertices.push(pointOfIntersection.clone());
  };
}