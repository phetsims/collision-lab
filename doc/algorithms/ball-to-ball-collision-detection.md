# How To Compute When Two Balls Will Collide:
Author: [@brandonLi8](https://github.com/brandonLi8)

#### Background:
The discrete nature of computers forces the physics engine of the Collision Lab simulation to follow a time-discretization approach to detecting and processing ball collisions. When balls collide it is likely that the collision occurred in between time steps. The flash implementation uses a traditional discrete collisions detection algorithm, where collisions are detected when Balls physically overlap. However, with sufficiently high velocity balls and/or large time steps (low frame rates), Ball collisions could go undetected, resulting in Balls "tunneling" through each other.

Thus, the HTML5 implementation uses a _priori_ [Collision Detection](https://en.wikipedia.org/wiki/Collision_detection) algorithm, where the CollisionEngine checks and processes collisions **before** they’ve happened. 

The question, answered in this document, is how the physics engine computes if any Balls will collide within a given time-step, and if so, when the balls exactly first collided. This method is called `detectBallToBallCollisions` in the model.

#### Known Quantities:

- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_1) - the position of the first Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_2) - the position of the second Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{v}_1) - the velocity of the first Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{v}_2) - the velocity of the second Ball involved in the collision at the *start* of the collision.<br>
- *radius<sub>1</sub>* - the radius of the first Ball involved in the collision.<br>
- *radius<sub>2</sub>* - the radius of the second Ball involved in the collision.

#### Unknown Quantities:

- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_{\contact\1}) - the position of the first Ball when the Balls first collided (in between frames).
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_{\contact\2}) - the position of the second Ball when the Balls first collided (in between frames).
- *time* - the elapsed time from when the Balls first collided to their current colliding positions.

<h1></h1>

#### Derivation:

Since Balls are undergoing uniform-motion, they are traveling in a straight line and aren't accelerating. Thus:

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \vec{r}_{\contact\1} = \vec{r}_1 %2B \textrm{time} \cdot\vec{v}_1">
&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \vec{r}_{\contact\2} = \vec{r}_2 %2B \textrm{time} \cdot\vec{v}_2">

<img src="https://github.com/phetsims/collision-lab/blob/priori/doc/algorithms/images/ball-contact-diagram.png" width="380">

Additionally, based on this picture, we know that when the Balls are exactly colliding, the distance between the centers of the balls is equal to the sum of the radii of the ball:

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \textrm{radius}_1 %2B \textrm{radius}_2 = \lVert\vec{r}_{\contact\2} - \vec{r}_{\contact\1}\rVert">

By substitution:

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \textrm{radius}_1 %2B \textrm{radius}_2 = \lVert (\vec{r}_2 %2B \textrm{time} \cdot\vec{v}_2) - (\vec{r}_1 %2B \textrm{time} \cdot\vec{v}_1) \rVert">

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \hphantom{\textrm{radius}_1 %2B \textrm{radius}_2} = \lVert (\vec{r}_2 - \vec{r}_1) %2B \textrm{time} \cdot (\vec{v}_2 - \vec{v}_2) \rVert">

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \hphantom{\textrm{radius}_1 %2B \textrm{radius}_2} = \lVert \Delta \vec{r} %2B \textrm{time} \cdot \Delta \vec{v} \rVert">

Now use the Vector property: <img src="https://render.githubusercontent.com/render/math?math=\large \vec{u} \cdot \vec{u} = \lVert \vec{u} \rVert ^2">

Thus,

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large (\textrm{radius}_1 %2B \textrm{radius}_2)^2 = \lVert \Delta \vec{r} %2B \textrm{time} \cdot \Delta \vec{v} \rVert ^2">

&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://render.githubusercontent.com/render/math?math=\large \hphantom{(\textrm{radius}_1 %2B \textrm{radius}_2)^2} = \lVert \Delta \vec{r} \rVert ^2 %2B 2 \cdot \textrm{time} (\Delta \vec{v} \cdot \Delta \vec{r}) %2B \textrm{time} ^2 \cdot \lVert \Delta \vec{v} \rVert ^2">

which is quadratic in-form for time with all known values.