// Sets up the object and three views: a block diagram on the corner, a map view, and a cross section view.

// Initialize strike and dip
let strike = 60
let dip = 10

// Set bed parameters
let bedThickness = .25
let numberOfBeds = 10

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
    camera: new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 1000 ),
    cameraPosition: [ 2, 2, 5 ]
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
  new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 0.99 ), // Right
  new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 0.99 ),  // Top
  new THREE.Plane( new THREE.Vector3( 0,  0, -1 ), 0.99 ),  // Front
  new THREE.Plane( new THREE.Vector3( 1,  0,  0 ), 0.99 ),  // Left
  new THREE.Plane( new THREE.Vector3( 0, 1,  0 ), 0.99 ),  // Bottom
  new THREE.Plane( new THREE.Vector3( 0,  0, 1 ), 0.99 )  //Back
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
    this.faces.forEach((face) => {

      /** Here I need logic to see if I'm at first or last bed that intersects (if previous or next bed doesn't intersect).
       * I need to flip the sequence to ['top', 'bottom', 'bottom', top'] if there are corners that need to be grabbed below the bed rather than above
       * I also need to figure out how to color if ZERO point intersect. Tricky, because relevant information shows up on other faces. 
       */

      // TODO pull out, make object oriented.
      let results = {}
      beds.children.forEach(bed => {
        let planes = {
          top: planeFromObject(bed, 4), // 4 and 5 are the indicies of the triangles on the top face of the bed (BoxGeometry) made by THREE.js
          bottom: planeFromObject(bed, 6), // 6 and 7 are the indicies of the triangles on the bottom face of the bed (BoxGeometry) made by THREE.js
        }
        
        results = face.findPointsOfIntersection(bed, planes);
       
      });
      if (results.sequenceCounter !== 4) {
        console.log(`WARNING!! Only ${results.sequenceCounter} corners found on face: `, face) 
      }
      
    });
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

    let firstZeroKey = '';
    let secondZeroKey = '';
    let fixedKey = '';
    let fixedVal = 0;

    let currentVertex = {
      x: -1,
      y: -1,
      z: -1,
    };

    // find zero direction, designate other two so we can work with them in predicatable order
    'xyz'.split('').forEach((letter) => {
      if (this.normalVector[letter]) {
        fixedKey = letter;
        fixedVal = this.normalVector[letter];
      } else {
        if(!firstZeroKey) {
          firstZeroKey = letter;
        } else {
          secondZeroKey = letter;
        }
      }
    })

    // Cycle around face (clockwise), so that vertices are in order and share a vertex with previous and next vertex. 
    currentVertex[fixedKey] = fixedVal;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[secondZeroKey] = 1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[firstZeroKey] = 1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[secondZeroKey] = -1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[firstZeroKey] = -1;
    vertices.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z)); // Fifth vertex is same as start - makes it easier to build edges by giong in a loop
    return vertices
  }

  // Recursive function to find where a bed intersects with the edges of a face.
  findPointsOfIntersection(bed, planes) {

    let points = [];
    let pointSequence = ['bottom', 'top', 'top', 'bottom'];
    let sequenceCounter = 0;
    let edgeCounter = 0;
    let edges = this.edges;

    while ((sequenceCounter < 4) && (edgeCounter < 4)) {
      // Add points and advance
      let point = planes[pointSequence[sequenceCounter]].intersectLine(edges[edgeCounter]);
      if (point) {
        points.push(point);
        sequenceCounter++;
      };

      // If haven't found, skip to next edge. 
      if (sequenceCounter === 0) {
        edgeCounter++;
      // If point, look for next one point on same edge, otherwise, add a corner
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
  return {points: points, sequenceCounter: sequenceCounter}
  }
}

let clipCube = new ClipCube


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

  // make wireframe
  // let materials = [
  //   new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
  //   new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
  // ];

  // Rotate Beds and add
  beds.rotation.y = Math.PI/180 * strike
  beds.rotation.x = Math.PI/180 * dip
  beds.rotation.order = "YXZ"
  scene.add(beds)

  clipCube.coverFaces();

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
    // if (camera.type == "PerspectiveCamera") {
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
folderLocal = gui.addFolder( 'Strike and Dip' )
props = {
          get 'Strike'() { 
            return beds.rotation.y*180/Math.PI; 
          },
          set 'Strike'( v ) { 
            beds.rotation.y = v*Math.PI/180;
          },

          get 'Dip'() { return beds.rotation.x*180/Math.PI; },
          set 'Dip'( v ) { beds.rotation.x = v*Math.PI/180 }
        };

folderLocal.add( props, 'Strike', 0, 360 );
folderLocal.add( props, 'Dip', 0, 90 );


// OLD JUNK
// function makeSides() {
//   // Delete existing sides if exist
//   scene.remove(scene.getObjectByName('sides', true));
//   // Create new sides
//   let sides = new THREE.Object3D();
//   sides.name = "sides"



//   if (yAxisBoundingLines.length === 0) {makeLinesFromVertices(); }
//   //Loop through each bed
//   for (let i = 0; i < beds.children.length; i++) {
//     //Set variables
//     let bed = beds.children[i];
//     let topPlane = planeFromObject(bed, 4); //5 also a top face
//     let bottomPlane = planeFromObject(bed, 6); //7 also a bottom face.
//     let topPointsIndexArray = []
//     let bottomPointsIndexArray = []
//     let sidesRing = new THREE.Geometry()
//     //Gather points of intersection
//     for (let j = 0; j < yAxisBoundingLines.length; j++) {
//       let verticalSides = new THREE.Geometry();
//       let topPointOfIntersection = topPlane.intersectLine(yAxisBoundingLines[j]);
//       let bottomPointOfIntersection = bottomPlane.intersectLine(yAxisBoundingLines[j]);

//       if (topPointOfIntersection) {
//         let index = sidesRing.vertices.push(topPointOfIntersection.clone()) - 1;//for some indecipherable reason, when you push to vertices, the function returns the index, plus one.
//         topPointsIndexArray.push(index)
//       } else {
//         console.log('no top point for:', yAxisBoundingLines[j])
//       };
//       if (bottomPointOfIntersection) {
//         let index = sidesRing.vertices.push(bottomPointOfIntersection.clone())-1;//for some indecipherable reason, when you push to vertices, the function returns the index, plus one.
//         bottomPointsIndexArray.push(index)
//       } else {
//         console.log('no bottom point for:', yAxisBoundingLines[j])
//       };
//     }
    
//     // loop through comparing vertices and make sides
//     if (topPointsIndexArray.length == 4 && bottomPointsIndexArray.length == 4) {
//       for (let j = 0; j < topPointsIndexArray.length; j++) {
//         for (let k = j + 1; k < topPointsIndexArray.length; k++) {
//           if ((sidesRing.vertices[topPointsIndexArray[j]].x == sidesRing.vertices[topPointsIndexArray[k]].x) || (sidesRing.vertices[topPointsIndexArray[j]].z == sidesRing.vertices[topPointsIndexArray[k]].z) ) { // if two point are adjacent
//             let normal = new THREE.Vector3( 0, 1, 0 )
//             let face1 = new THREE.Face3( topPointsIndexArray[j], topPointsIndexArray[k], bottomPointsIndexArray[j], normal ) // make face with two points on the top
//             let face2 = new THREE.Face3( bottomPointsIndexArray[j], bottomPointsIndexArray[k], topPointsIndexArray[k], normal ) // make face with two points on the bottom
//             console.log('face1', face1, 'face2', face2)
//             sidesRing.faces.push(face1)
//             sidesRing.faces.push(face2)
//           }
//         }
//       }
//     }
//     if (sidesRing.faces) {
//       ring = new THREE.Mesh( sidesRing, beds.children[i].material );
//       sides.add(ring)
//     }
//   }
//   console.log(sides.children);
//   scene.add(sides);
// }

// Soon obviated
// function generateClipVertices() {
//   let clipVertices = new THREE.Geometry()
//   for (let i = -1; i < 2; i += 2) {
//     for (let j = -1; j < 2; j += 2) {
//       for (let k = -1; k < 2; k += 2) {
//         let n = new THREE.Vector3(i,j,k)
//         clipVertices.vertices.push(n.clone())
//       }
//     }
//   }
//   return clipVertices
// }

// Soon obviated
// function makeLinesFromVertices() {
//   let clipVertices = generateClipVertices()
//   let vertices = clipVertices.vertices;
//   for (let i = 0; i < vertices.length; i++) {
//     for (let j = i+1; j < vertices.length; j++) {
//       if (vertices[i].x == vertices[j].x && vertices[i].y == vertices[j].y) {
//         zAxisBoundingLines.push(new THREE.Line3(vertices[i],vertices[j]))
//       } else if (vertices[i].x == vertices[j].x && vertices[i].z == vertices[j].z) {
//         yAxisBoundingLines.push(new THREE.Line3(vertices[i],vertices[j]))
//       } else if (vertices[i].y == vertices[j].y && vertices[i].z == vertices[j].z) {
//         xAxisBoundingLines.push(new THREE.Line3(vertices[i],vertices[j]))
//       }
//     }
//   }
// }

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
