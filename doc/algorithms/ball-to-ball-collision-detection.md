# How To Compute When Two Balls Will Collide:
Author: [@brandonLi8](https://github.com/brandonLi8)

<h3> Background:</h3> The discrete nature of computers forces the physics engine of the Collision Lab simulation to follow a time-discretization approach to detecting and processing ball collisions. When balls collide it is likely that the collision occurred in between time steps. The flash implementation uses a traditional discrete collisions detection algorithm, where collisions are detected when Balls physically overlap. However, with sufficiently high velocity balls and/or large time steps (low frame rates), Ball collisions could go undetected, resulting in Balls "tunneling" through each other.

Thus, the HTML5 implementation uses a _priori_ [Collision Detection](https://en.wikipedia.org/wiki/Collision_detection) algorithm, where the CollisionEngine checks and processes collisions **before** they’ve happened. 

The question, answered in this document, is how the physics engine computes if any Balls will collide within a given time-step, and if so, when the balls exactly first collided. This method is called `detectBallToBallCollisions` in the model.

<h3> Known Quantities:</h3>

- ![formula](https://render.githubusercontent.com/render/math?math=\vec{r})<sub>1</sub> - the position of the first Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\vec{r})<sub>2</sub> - the position of the second Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\vec{v})<sub>1</sub> - the velocity of the first Ball involved in the collision at the *start* of the collision.<br>
- ![formula](https://render.githubusercontent.com/render/math?math=\vec{v})<sub>2</sub> - the velocity of the second Ball involved in the collision at the *start* of the collision.<br>
- *radius<sub>1</sub>* - the radius of the first Ball involved in the collision.<br>
- *radius<sub>2</sub>* - the radius of the second Ball involved in the collision.

<h3> Unknown Quantities:</h3>

- ![formula](https://render.githubusercontent.com/render/math?math=\vec{r})<sub>contact 1</sub> - the position of the first Ball when the Balls first collided (in between frames).
- ![formula](https://render.githubusercontent.com/render/math?math=\vec{r})<sub>contact 2</sub> - the position of the second Ball when the Balls first collided (in between frames).
- *time* - the elapsed time from when the Balls first collided to their current colliding positions.

<h5> Derivation:</h5>

<img src="https://github.com/phetsims/collision-lab/blob/priori/doc/algorithms/images/ball-contact-diagram.png" width="420">


