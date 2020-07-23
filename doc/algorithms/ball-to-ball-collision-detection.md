# How To Compute When Two Balls Will Collide:
Author: [@brandonLi8](https://github.com/brandonLi8)

<h4>Background:</h4> The discrete nature of computers forces the physics engine of the Collision Lab simulation to follow a time-discretization approach to detecting and processing ball collisions. When balls collide it is likely that the collision occurred in between time steps. The flash implementation uses a traditional discrete collisions detection algorithm, where collisions are detected when Balls physically overlap. However, with sufficiently high velocity balls and/or large time steps (low frame rates), Ball collisions could go undetected, resulting in Balls "tunneling" through each other.

<br>Thus, the HTML5 implementation uses a _priori_ [Collision Detection](https://en.wikipedia.org/wiki/Collision_detection) algorithm, where the CollisionEngine checks and processes collisions **before** they’ve happened. 

The question, answered in this document, is how the physics engine computes if any Balls will collide within a given time-step, and if so, when the balls exactly first collided. This method is called `detectBallToBallCollisions` in the model.

<h4>Known Quantities:</h4>

- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_1) - the position of the first Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_2) - the position of the second Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{v}_1) - the velocity of the first Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{v}_2) - the velocity of the second Ball involved in the collision at the *start* of the collision.<br>
- *radius<sub>1</sub>* - the radius of the first Ball involved in the collision.<br>
- *radius<sub>2</sub>* - the radius of the second Ball involved in the collision.

<h4>Unknown Quantities:</h4>

- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_{\contact\1}) - the position of the first Ball when the Balls first collided (in between frames).
- ![formula](https://render.githubusercontent.com/render/math?math=\large\vec{r}_{\contact\2}) - the position of the second Ball when the Balls first collided (in between frames).
- *time* - the elapsed time from when the Balls first collided to their current colliding positions.

<h4>Derivation:</h4>

Since Balls are undergoing uniform-motion, they are traveling in a straight line and aren't accelerating. Thus:

<img src="https://render.githubusercontent.com/render/math?math=\large\vec{r}_{\contact\1} = \vec{r}_1 %2B \time \cdot \vec{v}_1">
<img src="https://render.githubusercontent.com/render/math?math=\large\vec{r}_{\contact\2} = \vec{r}_2 %2B \time \cdot \vec{v}_2">

<img src="https://github.com/phetsims/collision-lab/blob/priori/doc/algorithms/images/ball-contact-diagram.png" width="420">


