# Questions:
  * How do I make a function "bed geometry"?
  * Two approaches: 
    * Grab the faces from the block diagram object, find the intersection with beds, run it by my own calculations. Or built in intersection finders.
    * OR, aproach it through visualization - make one transparent, etc. 
  * Stepping back, let's look at how bock geometries are defined, to see if I can create my own trapezoidal version - or if the intersections thing works, (how do I color the faces? Maybe build a plane geometry using the bounding lines?), how I can extract things like edges and faces? 
  * How do I tie the geometry to the strike and dip symbol?
  * How do I extract the numbers for the strike and dip? 
  * How do I build object manipulation in? That is, how do I build controls to rotate the beds? examples/js/controls for reference. 

* Geometries to look at - Box geometry, geometries, edges geometry, polyhedron geometry, shapegeometry, wireframe geometry

# To do list - 
  * Add edges
  * Add lighting --DONE
  * Add controls for perspective --DONE
  * Split JS files into scene, object, etc. Wrap everything in a function and then call it. 
  * Put it into angular or ruby. 
  
# Useful resources

* http://blog.teamtreehouse.com/the-beginners-guide-to-three-js
* https://aerotwist.com/tutorials/getting-started-with-three-js/
* https://stackoverflow.com/questions/11060734/how-to-rotate-a-3d-object-on-axis-three-js - how to rotate object in world sapce. I want a vertical rotation in world space and a horizontal rotation in object space. 
  * object.rotateY(angle); - for rotation around the object's axis

https://stackoverflow.com/questions/16226693/three-js-show-world-coordinate-axes-in-corner-of-scene

"Rotations occur in the order specified by object.eulerOrder, not in the order you specify them.

The default Euler order is 'XYZ', so rotations are by default performed in the order X-first, then Y, then Z.

Rotations are performed with respect to the oject's internal coordinate system -- not the world coordinate system. So, for example, after the X-rotation occurs, the object's Y- and Z- axes will generally no longer be aligned with the world axes."

 - for top and cross section views - use orthographic projection rather than perspective projection

wireframe: true will give it a wire frame!!! (or only a wire frame?)
check out flat vs true shading, MeshPhongMaterial vs MeshLambertMaterial