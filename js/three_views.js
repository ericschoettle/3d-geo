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
    let faces = {};
    for (const [faceType, normalVector] of Object.entries(this.normalVectors)) {
      // Plane goes to infinity in all directions. Position, in direction of normal vectork, is half of edge length
      faces[faceType] = new Face(faceType, normalVector);
    }
    return faces;
  }
}

class Face {
  constructor (faceType, normalVector) {
    this.faceType = faceType;
    this.normalVector = normalVector;

    if (!this.verticies) {
      this.verticies = this.makeVerticies();
    }

    if (!this.edges) {
      this.edges = this.makeEdges();
    }
  }


  makeEdges() {
    let edges = []
    for (let i = 0; i < this.verticies.length -1; i++) {
      edges.push(new THREE.Line3(this.verticies[i], this.verticies[i + 1]))
    }
    return edges;
  }

  makeVerticies() {
    console.log('making verticies')
    let verticies = []

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
    'xyz'.split().forEach((letter) => {
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

    // Cycle around face (clockwise), so that verticies are in order and share a vertex with previous and next vertex. 
    currentVertex[fixedKey] = fixedVal;
    verticies.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[secondZeroKey] = 1;
    verticies.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[firstZeroKey] = 1;
    verticies.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[secondZeroKey] = -1;
    verticies.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z));
    currentVertex[firstZeroKey] = -1;
    verticies.push(new THREE.Vector3(currentVertex.x, currentVertex.y, currentVertex.z)); // Fifth vertex is same as start - makes it easier to build edges by giong in a loop
    return verticies
  }

  // makeFaces() {
  //   return normalVectors.keys();
  // } 

  // Do I want this on the Face or ClipCube class?
  coverFaces () {
    clipCube.faces.forEach((face) => {
      let planes = {
        top: planeFromObject(bed, 4), // 4 and 5 are the indicies of the triangles on the top face of the bed (BoxGeometry) made by THREE.js
        bottom: planeFromObject(bed, 6), // 6 and 7 are the indicies of the triangles on the bottom face of the bed (BoxGeometry) made by THREE.js
      }
      /** Here I need logic to see if I'm at first or last bed that intersects (if previous or next bed doesn't intersect).
       * I need to flip the sequence to ['top', 'bottom', 'bottom', top'] if there are corners that need to be grabbed below the bed rather than above
       * I also need to figure out how to color if ZERO point intersect. Tricky, because relevant information shows up on other faces. 
       */

      // TODO pull out, make object oriented. 
      beds.children.forEach(bed => {
        findPointsOfIntersection([], ['bottom', 'top', 'top', 'bottom'], 0, 0)
        function findPointsOfIntersection(points, pointSequence, sequenceID, currentEdgeID) {
          // No points found
          if (sequenceID === 0 && currentEdgeID === 4) {
            return 'false';
          }
          // Add points and advance
          let point = planes[pointSequence[sequenceID]].intersectLine(face.edge[currentEdgeID]);
          if (point) {
            points.push(point)
            sequenceID++
          };
          // If haven't found, skip to next edge. 
          if (sequenceID === 0) {
            findPointsOfIntersection(points, pointSequence, sequenceID, currentEdgeID++);
          }
          // If point, look for next one point on same edge, otherwise, add a corner
          else if (sequenceID === 1) { // this needs to have a check for if 
            if (point) {
              secondPointOnEdge(points, pointSequence, sequenceID, currentEdgeID);
            } else {
              let end = planes[pointSequence[4]].intersectLine(face.edge[currentEdgeID]);
              if (end) {
                points.push(point)
                return points
              } else {
                addCorner(points, pointSequence, sequenceID, currentEdgeID);
              }
            }
          }
          // on 'outside' of color, skip to next edge
          else if (sequenceID === 2) {
            findPointsOfIntersection(points, pointSequence, sequenceID, currentEdgeID++);
          // on 'inside' of color
          } else if (sequenceID === 3) {
            secondPointOnEdge(points, pointSequence, sequenceID, currentEdgeID++);
          } else { // sequenceID === 4
            return points;
          }
        }
        function secondPointOnEdge(points, pointSequence, sequenceID, currentEdgeID) {
          // Add points and advance
          let point = planes[pointSequence[sequenceID]].intersectLine(face.edge[currentEdgeID]);
          if (point) {
            points.push(point)
            findPointsOfIntersection(points, pointSequence, sequenceID++, currentEdgeID++);
          } else {
            addCorner(points, pointSequence, sequenceID, currentEdgeID);
          }
        }
        function addCorner(points, pointSequence, sequenceID, currentEdgeID) {

          findPointsOfIntersection(points, pointSequence, sequenceID, currentEdgeID++);
        }
      });
    });
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



//   if (yAxisBoundingLines.length === 0) {makeLinesFromVerticies(); }
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
//         let index = sidesRing.verticies.push(topPointOfIntersection.clone()) - 1;//for some indecipherable reason, when you push to verticies, the function returns the index, plus one.
//         topPointsIndexArray.push(index)
//       } else {
//         console.log('no top point for:', yAxisBoundingLines[j])
//       };
//       if (bottomPointOfIntersection) {
//         let index = sidesRing.verticies.push(bottomPointOfIntersection.clone())-1;//for some indecipherable reason, when you push to verticies, the function returns the index, plus one.
//         bottomPointsIndexArray.push(index)
//       } else {
//         console.log('no bottom point for:', yAxisBoundingLines[j])
//       };
//     }
    
//     // loop through comparing verticies and make sides
//     if (topPointsIndexArray.length == 4 && bottomPointsIndexArray.length == 4) {
//       for (let j = 0; j < topPointsIndexArray.length; j++) {
//         for (let k = j + 1; k < topPointsIndexArray.length; k++) {
//           if ((sidesRing.verticies[topPointsIndexArray[j]].x == sidesRing.verticies[topPointsIndexArray[k]].x) || (sidesRing.verticies[topPointsIndexArray[j]].z == sidesRing.verticies[topPointsIndexArray[k]].z) ) { // if two point are adjacent
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
// function generateClipVerticies() {
//   let clipVerticies = new THREE.Geometry()
//   for (let i = -1; i < 2; i += 2) {
//     for (let j = -1; j < 2; j += 2) {
//       for (let k = -1; k < 2; k += 2) {
//         let n = new THREE.Vector3(i,j,k)
//         clipVerticies.verticies.push(n.clone())
//       }
//     }
//   }
//   return clipVerticies
// }

// Soon obviated
// function makeLinesFromVerticies() {
//   let clipVerticies = generateClipVerticies()
//   let verticies = clipVerticies.verticies;
//   for (let i = 0; i < verticies.length; i++) {
//     for (let j = i+1; j < verticies.length; j++) {
//       if (verticies[i].x == verticies[j].x && verticies[i].y == verticies[j].y) {
//         zAxisBoundingLines.push(new THREE.Line3(verticies[i],verticies[j]))
//       } else if (verticies[i].x == verticies[j].x && verticies[i].z == verticies[j].z) {
//         yAxisBoundingLines.push(new THREE.Line3(verticies[i],verticies[j]))
//       } else if (verticies[i].y == verticies[j].y && verticies[i].z == verticies[j].z) {
//         xAxisBoundingLines.push(new THREE.Line3(verticies[i],verticies[j]))
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
  let worldA = object.localToWorld(objectPointA.copy(object.geometry.verticies[object.geometry.faces[faceNumber].a]));
  let worldB = object.localToWorld(objectPointB.copy(object.geometry.verticies[object.geometry.faces[faceNumber].b]));
  let worldC = object.localToWorld(objectPointC.copy(object.geometry.verticies[object.geometry.faces[faceNumber].c]));
  mathPlane.setFromCoplanarPoints(worldA, worldB, worldC);
  return mathPlane;
}
