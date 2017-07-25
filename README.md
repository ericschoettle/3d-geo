# Questions:
  * Two approaches: 
    * Grab the faces from the block diagram object, find the intersection with beds, run it by my own calculations. Or built in intersection finders.
    * OR, aproach it through visualization - make one transparent, etc. 
  * Stepping back, let's look at how bock geometries are defined, to see if I can create my own trapezoidal version - or if the intersections thing works, (how do I color the faces? Maybe build a plane geometry using the bounding lines?), how I can extract things like edges and faces? 
  * How do I make the strike and dip symbol appear on the surface of the bed?
  * Do I change bed geometry with inputs or dragging? MVP: inputs, later: dragging. Actually either - it would be cool if it snapped to a strike and dip that you specified or you could drag it. Perhaps hold a key down and click to manipulate the camera, no key moves the beds?
    * If I'm doing this approach, how do I extract the strike and dip from the plane? Can I force the rotations to be only of strike and dip type, or do a little math?


# To do list - 
  * Add edges - make a copy of the object/group and run it with "wireframe: true"
  * Add lighting --DONE
  * Add controls for perspective --DONE
  * Split JS files into scene, object, etc. Wrap everything in a function and then call it. DONE

  * Perform rotation and slicing:
    * Make clipping shape into a box
    * Find intersections of clipping plane and beds
    * Make new geometry out of resulting shapes (preferably grabbing colors from original shapes)
  
  * Add strike and dip symbol to the top bed (and map view)
    * Find face of top bed, locate center
    * Make an image that I can put on an otherwise transparent plane
    * Orient with strike and dip - either logic from arbitrary position or (better) only allow plane to be rotated according to the rules of strike and dip.
    * Add text with a maintained orientation - how to position it on the page? 
  
  * Add cross section and map views
  * STRETCH = Add compass rose/axes arrows in another (transparent) scene, be careful about rotations. 

  * Add logic for quadrants vs 360 degree approach
  * Add UI box with inputs for strike and dip, locks for either (if rotating manually), show/hide for strike and dip, etc. 
  
  * STRETCH - Add compass that sits flat (stretch: user can click on compass to rotate it two ways against surface, changes color when flat)
  * STRETCH - add ability to use compass on underside of rock
  * STRETCH - add overturned symbol and application

  
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