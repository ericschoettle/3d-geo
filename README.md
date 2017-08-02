# Questions:
  * Can I make rotations of only strike and dip possible, and executed by mouse?
    * Can I apply those only to the compass object?

  * Would extrude and a sine wave give me folded beds?


# To do list -


  * Add strike and dip symbol to the top bed (and map view)
    * Find face of top bed, locate center
    * Make an image that I can put on an otherwise transparent plane
    * Orient with strike and dip - either logic from arbitrary position or (better) only allow plane to be rotated according to the rules of strike and dip.
    * Add text with a maintained orientation - how to position it on the page?

  * Add cross section and map views DONE -
    * Get them to display simultaneously
  * STRETCH = Add compass rose/axes arrows in another (transparent) scene, be careful about rotations.

  * Add logic for quadrants vs 360 degree approach
  * Fix UI box

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


OK, so plan for edges:

* For loop testing top face against all lines - push to points
* For loop testing bottom face against all lines - push to points
* Points - group into sets of those on the same plane - test if the points have the same value (one or -1) in the x, y, or z direction
* Make faces: if four points, find two opposite corners (larger on one axis, smaller on the other axis). Use those twice, and use the other two points once with the two repeated points to make triangular.
* Make object out of those faces with the same color as the bed.
* Text if box contains corner? That would be useful.
