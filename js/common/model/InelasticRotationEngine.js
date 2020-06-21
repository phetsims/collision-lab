
// Copyright 2019-2020, University of Colorado Boulder

/**
 * InelasticRotationEngine handles all continual ball-to-ball collision responses for perfectly inelastic collisions
 * that 'stick'.
 *
 * Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation, where
 * Balls completely stick together and rotate around the center of mass of the cluster of Balls, if and only if the
 * collision isn't head-on.
 *
 * Currently, InelasticRotationEngine only supports rotations of 2 Balls. If the elasticity is set to perfectly
 * inelastic collision that is sticky, there must only be 2 Balls in the BallSystem. See
 * https://github.com/phetsims/collision-lab/issues/87.
 *
 * ## Collision Response
 *
 *  - When a collision between the 2 Balls is detected by CollisionEngine and the collision is a perfectly inelastic
 *    collisions that 'sticks,' the first calculation that InelasticRotationEngine computes is the velocity of the
 *    center of mass of 2 balls.
 *
 *
 * https://en.wikipedia.org/wiki/Angular_momentum
 *https://en.wikipedia.org/wiki/Inelastic_collision#Perfectly_inelastic_collision
 *https://en.wikipedia.org/wiki/Moment_of_inertia
 *https://en.wikipedia.org/wiki/Parallel_axis_theorem
 *
 *
 *  * The algorithms for particle-particle collisions and particle-container collisions were adapted from the Java
 * implementation of Gas Properties. They differ from the standard rigid-body collision model as described in (e.g.)
 * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 * For historical background on how the Java implementation informed this implementation, see:
 * https://github.com/phetsims/gas-properties/issues/37
 * https://github.com/phetsims/gas-properties/issues/40
 *
 * While code comments attempt to describe this implementation clearly, fully understanding the implementation may
 * require some general background in collisions detection and response. Some useful references include:

 *
 *
  //
  // The issue of rotations were first discussed in https://github.com/phetsims/collision-lab/issues/3 and
  // later in https://github.com/phetsims/collision-lab/issues/87. The collision-response algorithms for this type of
  // collision is handled in InelasticRotationEngine.js.
 *
 *
 * CollisionEngine handles all collision detection and responses. It is the physics engine that is used for all screens
 * of the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - The CollisionEngine deals with two types of collisions: ball-to-ball and ball-to-border collisions. Collisions
 *     are detected after the collision occurs by checking if any two Balls physically overlap or if any Ball overlaps
 *     with the border of the PlayArea.
 *
 *   - Since there are only a maximum of 4 Balls in a PlayArea at a time, there are a maximum of 6 unique pairs of
 *     Balls to check, so a spatial partitioning collision detection optimization is not used.
 *
 * ## Collision response:
 *
 *   - Collision response determines what affect a collision has on a Ball's motion. When a collision has been detected,
 *     it is processed by first analytically determining the how long the Balls have been overlapping. Using this time,
 *     the collision is reconstructed to the exact moment of contact to more accurately simulate colliding balls, and
 *     the position of Balls after the collision are updated to a more realistic position.
 *     The algorithms for finding the overlapping time of collisions can be found below:
 *       + https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-ball-time-of-impact-derivation.pdf
 *       + https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-border-time-of-impact-derivation.pdf
 *
 *   - The algorithms for Ball collisions were adapted but severely improved from the flash implementation of Collision
 *     Lab. They follow the standard rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 *   - The HTML5 implementation of this simulation contains two types of perfectly inelastic collisions. See
 *     InelasticCollisionTypes for more documentation. CollisionEngine itself ONLY handles 'slip' collisions and
 *     defers all 'stick' collision responses to the InelasticRotationEngine sub-model. See InelasticRotationEngine.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';

class InelasticRotationEngine {


  constructor() {

    this.stickyBallCluster = null;
  }

  registerStickyCollision( ball1, ball2 ) {

    // Convenience references to the other known Ball values.
    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1t = ball1.velocity.dot( tangent );
    const v2t = ball2.velocity.dot( tangent );
    const centerOFMassVel = ( m1 * v1t + m2 * v2t ) / ( m1 + m2 );

    ball1.position = r1;
    ball2.position = r2;

    this.compositeStuckBall = new CompositeStuckBalls( ball1, ball2, new Vector2( v1xP, v1yP ) );
      this.compositeStuckBall.step( overlappedTime );
  }

  step() {

  }

  reset() {

  }

  isHandling() {
    return false;
  }

  handleClusterToBorderCollisions() {

  }

  handleClusterToClusterCollisions() {
    assert( false )
  }
}

collisionLab.register( 'InelasticRotationEngine', InelasticRotationEngine );
export default InelasticRotationEngine;