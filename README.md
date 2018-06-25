# For you:

  Check it out! https://bit.ly/2sG101g

  This is an app to help visualize strike and dip, the standard way that geologists record the orientation of planes in space. Use the controls on the right to play around!



# For me:

  * Page layout
    * Take controls out of folder
    * Use real fonts
    * Make sizes dynamic but with fixed aspect ratio. Should I base on width or height?
    * Add north arrows
    * Indicate where cross section is?

  * Add strike and dip symbol to the top bed (and map view)
    * Add symbol and rotate with strike
    * Add text with dynamically updated dip
    * Advanced: Move text in a circle based on dip
    * Advanced: Move symbol to the middle of a bed. Or perhaps a random spot on the diagram?


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
