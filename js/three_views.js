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

var xAxisBoundingLines = [],
  yAxisBoundingLines = [],
  zAxisBoundingLines = [];

var group = new THREE.Object3D();

// Make beds
for (var i = 0; i < numberOfBeds; i++) {
  var geometry = new THREE.BoxGeometry(4, bedThickness, 4)
  var material = new THREE.MeshPhongMaterial({
          color: new THREE.Color( Math.sin( i * 0.5 ) * 0.5 + 0.5, Math.cos( i * 1.5 ) * 0.5 + 0.5, Math.sin( i * 4.5 + 0 ) * 0.5 + 0.5 ),
          // side: THREE.DoubleSide,
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

  // make wireframe
  // var materials = [
  //   new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
  //   new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
  // ];

  // Strike
  group.rotation.y = Math.PI/180 * strike
  //Dip
  group.rotation.x = Math.PI/180 * dip
  group.rotation.order = "YXZ"
  scene.add(group)

  makeSides();

  renderer = new THREE.WebGLRenderer( { antialias: true, localClippingEnabled: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  var text1 = document.createElement('div');
  text1.style.position = 'absolute';
  text1.style.width = 100;
  text1.style.height = 100;
  text1.style.color = "white";
  text1.innerHTML = "Block Diagram";
  text1.style.top = '12%';
  text1.style.left = '20%';
  document.body.appendChild(text1);

  var text2 = document.createElement('div');
  text2.style.position = 'absolute';
  text2.style.width = 100;
  text2.style.height = 100;
  text2.style.color = "white";
  text2.innerHTML = "Map View";
  text2.style.top = '8%';
  text2.style.left = '72%';
  document.body.appendChild(text2);

  var text3 = document.createElement('div');
  text3.style.position = 'absolute';
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


// make GUI
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

function makeSides() {
  // var sidesGroup = new THREE.Object3D();
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
            var normal = new THREE.Vector3( 0, 0, 1 )
            var face1 = new THREE.Face3( topPointsIndexArray[j], topPointsIndexArray[k], bottomPointsIndexArray[j], normal ) // make face with two points on the top
            var face2 = new THREE.Face3( bottomPointsIndexArray[j], bottomPointsIndexArray[k], topPointsIndexArray[k], normal ) // make face with two points on the bottom
            sidesRing.faces.push(face1)
            sidesRing.faces.push(face2)
          }
        }
      }
    }
    if (sidesRing.faces) {
      ring = new THREE.Mesh( sidesRing, group.children[i].material );
      scene.add(ring)
    }
  }
  // debugger
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
