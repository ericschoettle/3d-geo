// Sets up the object and three views: a block diagram on the corner, a map view, and a cross section view.

// Initialize strike and dip
let strike = 20;
let dip = 30;

// Set view defaults
let transparent = false;
let spinCamera = false;

// Set bed parameters
let bedThickness = .25;
let numberOfBeds = 14;

// Declare variables for later use
let container;
let scene, renderer;
let mesh, light;
let windowWidth, windowHeight;
let views = [
  // Block Diagram camera
  {
    left: 0,
    top: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color("#3d3d3d"),
    camera: new THREE.PerspectiveCamera( 20 , window.innerWidth / window.innerHeight, 0.1, 1000 ),
    cameraPosition: [ 4, 4, 10 ]
  },
  // Cross section Camera
  {
    left: 0.5,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color("#3d3d3d"),
    camera: new THREE.OrthographicCamera( -2, 2, 2, -2, -500, 1000 ),
    cameraPosition: [ 0, 0, 5 ]
  },
  // Map View Camera
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

// Putting beds into one Object3D allows them to be rotated together
let beds = new THREE.Object3D();

// clip planes define a fixed cube, the inside of which is visible. 
let clipPlanes = [
  // Plane(Normal vector (x, y, z), distance)
  new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 1.0 ), // Right
  new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 1.0 ),  // Top
  new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 1.0 ),  // Front
  new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 1.0 ),  // Left
  new THREE.Plane( new THREE.Vector3( 0, 1,  0 ), 1.0 ),  // Bottom
  new THREE.Plane( new THREE.Vector3( 0,  0, 1 ), 1.0 )  //Back
];

// Make beds
for (let i = 0; i < numberOfBeds; i++) {
  let geometry = new THREE.BoxGeometry(4, bedThickness, 4)
  let material = new THREE.MeshPhongMaterial({
          color: new THREE.Color( Math.sin( i * 0.5 ) * 0.5 + 0.5, Math.cos( i * 1.5 ) * 0.5 + 0.5, Math.sin( i * 4.5 + 0 ) * 0.5 + 0.5 ),
          // side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
          clipIntersection: false
        })

  let bed = new THREE.Mesh( geometry, material );
  bed.position.y = -1*numberOfBeds*bedThickness/2 + bedThickness*i
  beds.add( bed )
}

class ClipCube {
  constructor(edgeLength) {
    //Edge length of 2 gives faces at 1, -1, respectively, with cube centered on (0,0,0,)
    this.edgeLength = edgeLength || 2;

    // Normal to each face of cube. 
    this.normalVectors = {
      right: new THREE.Vector3( -1,  0,  0 ),
      top: new THREE.Vector3( 0, -1,  0 ), 
      front: new THREE.Vector3( 0,  0, -1 ), 
      left: new THREE.Vector3( 1,  0,  0 ),
      bottom: new THREE.Vector3( 0, 1,  0 ),
      back: new THREE.Vector3( 0,  0, 1 )
    }
    // Clip planes define a cube, for which only things on the inside are visible. 
    if (!this.clipPlanes) {
      this.clipPlanes = this.makeClipPlanes();
    }

    // Build faces automatically, can recreate with function if I need them or want to change something
    if (!this.faces) {
      this.faces = this.makeFaces();
    }
  }

  // Clip planes define a cube, for which only things on the inside are visible. 
  makeClipPlanes() {
    let clipPlanes = {};
    for (const [faceType, normalVector] of Object.entries(this.normalVectors)) {
      // Plane goes to infinity in all directions. Position, in direction of normal vectork, is half of edge length
      clipPlanes[faceType] = new THREE.Plane(normalVector, this.edgeLength/2);
    }
    return clipPlanes;
  }

  // Clip planes define a cube, for which only things on the inside are visible. 
  makeFaces() {
    let faces = [];
    for (const [faceType, normalVector] of Object.entries(this.normalVectors)) {
      // Plane goes to infinity in all directions. Position, in direction of normal vectork, is half of edge length
      faces.push(new Face(faceType, normalVector));
    }
    return faces;
  }


  coverFaces () {
    let coveredFaces = new THREE.Group();
    this.faces.forEach((face) => {
      let coveredFace = new THREE.Group();
      coveredFace.name = face.faceType;
      
      for (let i = 0; i < beds.children.length; i++) {
        const bed = beds.children[i];
        let planes = {
          top: planeFromObject(bed, 4), // 4 and 5 are the indicies of the triangles on the top face of the bed (BoxGeometry) made by THREE.js
          bottom: planeFromObject(bed, 6), // 6 and 7 are the indicies of the triangles on the bottom face of the bed (BoxGeometry) made by THREE.js
        }
        
        let points = face.findPointsOfIntersection(bed, planes);

        if (Array.isArray(points) && points.length >= 3) {
          let geometry = makeGeometryFromPoints(points);
          geometry.computeFaceNormals();
          // geometry.computeVertexNormals();
          let material = new THREE.MeshPhongMaterial({
            color: bed.material.color,
            side: THREE.DoubleSide,
          })
          let coveredBedFace = new THREE.Mesh( geometry, material);
          scene.add(coveredBedFace);
          coveredFace.add(coveredBedFace);
        }
      }
      coveredFaces.add(coveredFace);     
    });
    coveredFaces.name = 'coveredFaces';
    scene.add(coveredFaces);
    return coveredFaces;
  }
}

// Takes a vector with two zero components and one with a value, returns direction and value;
function getVectorDirection(vector) {
  let firstZeroKey = '';
  let secondZeroKey = '';
  let directionKey = '';
  let directionValue = 0;

  'xyz'.split('').forEach((letter) => {
    if (vector[letter]) {
      directionKey = letter;
      directionValue = vector[letter];
    } else {
      if(!firstZeroKey) {
        firstZeroKey = letter;
      } else {
        secondZeroKey = letter;
      }
    }
  });

  return {
    firstZeroKey: firstZeroKey,
    secondZeroKey: secondZeroKey,
    directionKey: directionKey,
    directionValue: directionValue
  }
}

class Face {
  constructor (faceType, normalVector) {
    this.faceType = faceType;
    this.normalVector = normalVector;

    if (!this.vertices) {
      this.vertices = this.makeVertices();
    }

    if (!this.edges) {
      this.edges = this.makeEdges();
    }
  }

  makeEdges() {
    let edges = []
    for (let i = 0; i < this.vertices.length -1; i++) {
      edges.push(new THREE.Line3(this.vertices[i], this.vertices[i + 1]))
    }
    return edges;
  }

  makeVertices() {
    // console.log('making vertices')
    let vertices = []

    let currentVertex = {
      x: -1,
      y: -1,
      z: -1,
    };
    
    let normalComponents = getVectorDirection(this.normalVector);

    // Cycle around face (clockwise), so that vertices are in order and share a vertex with previous and next vertex. 
    currentVertex[normalComponents.directionKey] = normalComponents.directionValue;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[normalComponents.secondZeroKey] = 1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[normalComponents.firstZeroKey] = 1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[normalComponents.secondZeroKey] = -1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[normalComponents.firstZeroKey] = -1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z)); // Fifth vertex is same as start - makes it easier to build edges by giong in a loop
    return vertices
  }
  // Takes a plane and finds a point where that plane intersects a face. Returns the point and the edge where the intersection happens. 
  findInitialIntersection(plane) {
    let edges = this.edges;
    let initialEdge = null;
    let initialEdgeIndex = null;
    let initialPoint = null;

    edges.forEach((edge, index)=> {
      let point = plane.intersectLine(edge);
      if (point) {
        initialEdgeIndex = index;
        initialEdge = edge;
        initialPoint = point;
      }
    });

    return initialPoint ? {initialEdge: initialEdge, initialEdgeIndex: initialEdgeIndex, initialPoint: initialPoint} : null;
  }

  // Reorders the edges so that a search for points of intersection between two planes and a face will go in a predictable order, eg bottom plane, top, top, bottom, and begin on the edge with the first bottom. 
  reorderEdges(plane, edges, initial) {
    let reorderedEdges = [];
    // Test for reversal
    if (this.testForEdgeReversal(plane, edges, initial)) {
      // Reverse and Reorder
      for (let i = initial.initialEdgeIndex + edges.length; i > initial.initialEdgeIndex; i--) {
        // Switch direction of edge
        reorderedEdges.push(new THREE.Line3(edges[i % edges.length].end, edges[i% edges.length].start));
      }
    } else {
      // reorder
      for (let i = initial.initialEdgeIndex; i < initial.initialEdgeIndex + edges.length; i++) {
        reorderedEdges.push(edges[i % edges.length]);  
      }
    }
    return reorderedEdges;
  }

  testForEdgeReversal(plane, edges, initial) {
    let edgeDirection = {component: null, value: null}
    let edgeVector = initial.initialEdge.delta();
    edgeDirection = getVectorDirection(edgeVector);
    return (Math.sign(edgeDirection.directionValue) === Math.sign(plane.normal[edgeDirection.directionKey]));
  }

  // Find where a bed intersects with the edges of a face, return 
  findPointsOfIntersection(bed, planes) {

    let edges = this.edges;
    let points = [];
    let initialBottom = this.findInitialIntersection(planes.bottom);

    if (initialBottom) {
      edges = this.reorderEdges(planes.bottom, this.edges, initialBottom);
      return this.verticiesInOrder(bed, planes, edges, ['bottom', 'top', 'top', 'bottom']);
    } else {
      let initialTop = this.findInitialIntersection(planes.top);
      if (initialTop) {
        edges = this.reorderEdges(planes.top, this.edges, initialTop);
        return this.verticiesInOrder(bed, planes, edges, ['top', 'bottom', 'bottom', 'top']);
      } else {
        // this.checkLastBed(bed, planes)
        return [];
      } 
    }
  }

  verticiesInOrder(bed, planes, edges, pointSequence) {

    let sequenceCounter = 0;
    let edgeCounter = 0;
    let points = [];

    while ((sequenceCounter < 4) && (edgeCounter < 4)) {
      // Add points and advance
      let point = planes[pointSequence[sequenceCounter]].intersectLine(edges[edgeCounter]);
      if (point) {
        points.push(point);
        sequenceCounter++; 
      } 
      // If haven't found, skip to next edge. 
      if (sequenceCounter === 0) {
          edgeCounter++;
      // If point, look for next point on same edge, otherwise, add a corner
      } else if (sequenceCounter === 1) { 
        if (point) {
          secondPointOnEdge()
        // Check for end or add corner.
        } else {
          let end = planes[pointSequence[3]].intersectLine(edges[edgeCounter]);
          if (end) {
            points.push(end)
            break
          } else {
            addCorner();
          }
        }
      // on 'outside' of color, skip to next edge
      } else if (sequenceCounter === 2) {
        edgeCounter++;
      // on 'inside' of color
      } else if (sequenceCounter === 3) {
        secondPointOnEdge()
      }
    }

    function secondPointOnEdge() {
      // Add points and advance
      let point = planes[pointSequence[sequenceCounter]].intersectLine(edges[edgeCounter]);
      if (point) {
        // console.log('SECOND POINT ON EDGE', 'point: ', point, 'sequenceCounter: ', sequenceCounter, 'plane:', pointSequence[sequenceCounter], 'edgeCounter: ', edgeCounter);
        points.push(point)
        sequenceCounter++;
        edgeCounter++;
      } else {
        addCorner();
      }
    }
  
    function addCorner() {
      points.push(edges[edgeCounter].end);
      edgeCounter++;
    }
  
    return points
  }
}

let clipCube = new ClipCube

// Only reliable for polygons with all convex corners. It returns a THREE.Geometry object
function makeGeometryFromPoints(points, normalVector) {
  if (points.length < 3) {
    debugger;
    return {error: `Cannot build a polygon with less than three points.`}
  }
  let geometry = new THREE.Geometry();
  for (let i = 0; i < points.length; i++) {
    geometry.vertices.push(points[i]);
  }
  for (let i = 2; i < points.length; i++) {
    geometry.faces.push(new THREE.Face3(0, i-1, i, normalVector));
  }
  return geometry;
}

function planeFromObject(object, faceNumber) {
  let objectPointA = new THREE.Vector3(),
    objectPointB = new THREE.Vector3(),
    objectPointC = new THREE.Vector3();

  let mathPlane = new THREE.Plane();
  scene.updateMatrixWorld();
  let worldA = object.localToWorld(objectPointA.copy(object.geometry.vertices[object.geometry.faces[faceNumber].a]));
  let worldB = object.localToWorld(objectPointB.copy(object.geometry.vertices[object.geometry.faces[faceNumber].b]));
  let worldC = object.localToWorld(objectPointC.copy(object.geometry.vertices[object.geometry.faces[faceNumber].c]));
  mathPlane.setFromCoplanarPoints(worldA, worldB, worldC);
  return mathPlane;
}


init();
animate();
function init() {
  container = document.getElementById( 'container' );
  scene = new THREE.Scene();

  // Ambient light allows you to see all sides of objects
  let ambientLight = new THREE.AmbientLight()
  // Point light gives shadow
  let pointLight = new THREE.PointLight(0xffffff, 1, 0, 2);
  pointLight.position.set(-100,200,100);
  scene.add( ambientLight, pointLight );
  // scene.add( ambientLight );

  //Set cameras to look at scene
  for (let i =  0; i < views.length; ++i ) {
    let camera = views[i].camera;
    camera.position.fromArray( views[i].cameraPosition );
    camera.lookAt(scene.position)
  }

  let canvas = document.createElement( 'canvas' );
  canvas.width = 128;
  canvas.height = 128;
  let context = canvas.getContext( '2d' ); // necessary?

  // Rotate Beds and add
  beds.rotation.y = Math.PI/180 * strike
  beds.rotation.x = Math.PI/180 * dip
  beds.rotation.order = "YXZ"
  scene.add(beds)

  if (!transparent) {
    clipCube.coverFaces();
  }
  
  

  // todo: find a good place for this stuff
  renderer = new THREE.WebGLRenderer( { antialias: true, localClippingEnabled: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // makeSides();

  let text1 = document.createElement('div');
  text1.style.position = 'absolute';
  text1.style.width = 100;
  text1.style.height = 100;
  text1.style.color = "white";
  text1.innerHTML = "Block Diagram";
  text1.style.top = '12%';
  text1.style.left = '20%';
  document.body.appendChild(text1);

  let text2 = document.createElement('div');
  text2.style.position = 'absolute';
  text2.style.width = 100;
  text2.style.height = 100;
  text2.style.color = "white";
  text2.innerHTML = "Map View";
  text2.style.top = '8%';
  text2.style.left = '72%';
  document.body.appendChild(text2);

  let text3 = document.createElement('div');
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
  for ( let i = 0; i < views.length; ++i ) {
    let view = views[i];
    let camera = view.camera;
    // if (camera.type === "PerspectiveCamera" && viewControls.spinCamera === true) {
    // 	let controls = new THREE.OrbitControls(camera);
    // 	scene.userData.controls = controls;
    // }
    let left   = Math.floor( windowWidth  * view.left );
    let top    = Math.floor( windowHeight * view.top );
    let width  = Math.floor( windowWidth  * view.width );
    let height = Math.floor( windowHeight * view.height );
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

let gui = new dat.GUI();

strikeAndDipGUIFolder = gui.addFolder( 'Strike and Dip' );
viewControlsGUIFolder = gui.addFolder( 'View Controls' );

strikeAndDipProps = {
  get 'Strike'() { 
    return beds.rotation.y*180/Math.PI; 
  },
  set 'Strike'( v ) {  
    beds.rotation.y = v*Math.PI/180;
    if (!transparent) {
      let coveredFaces = scene.getObjectByName('coveredFaces');
      scene.remove( coveredFaces );
      clipCube.coverFaces();
    }

  },

  get 'Dip'() { return beds.rotation.x*180/Math.PI; },
  set 'Dip'( v ) { 
    beds.rotation.x = v*Math.PI/180 
    if (!transparent) {
      let coveredFaces = scene.getObjectByName('coveredFaces');
      scene.remove( coveredFaces );
      clipCube.coverFaces();
    }
  }
};

strikeAndDipGUIFolder.add( strikeAndDipProps, 'Strike', 0, 360 );
strikeAndDipGUIFolder.add( strikeAndDipProps, 'Dip', 0, 90 );

// Set view controls
let viewControls =  {
  get 'Transparent'() {return transparent},
  set 'Transparent' (value) {
    transparent = value;
    if (transparent) {
      let coveredFaces = scene.getObjectByName('coveredFaces');
      scene.remove( coveredFaces );
    } else {
      clipCube.coverFaces();
    }
  },
  'Spin Camera': spinCamera
}
viewControlsGUIFolder.add( viewControls, 'Transparent');
// viewControlsGUIFolder.add( viewControls, 'Spin Camera');


