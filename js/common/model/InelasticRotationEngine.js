
// Copyright 2019-2020, University of Colorado Boulder

/**
 * InelasticRotationEngine handles all continual ball-to-ball collision responses for perfectly inelastic collisions
 * that 'stick'. Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation,
 * where Balls completely stick together and rotate around the center of mass of the cluster of Balls, if and only if
 * the collision is not head-on.
 *
 * Currently, InelasticRotationEngine only supports rotations of 2 Balls. If the elasticity is set to perfectly
 * inelastic collision that is sticky, there must only be 2 Balls in the BallSystem. See
 * https://github.com/phetsims/collision-lab/issues/87.
 *
 * ## Collision Response
 *
 *  - When a collision between the 2 Balls is detected (by CollisionEngine), and the collision is a perfectly inelastic
 *    collisions that 'sticks', the first calculation that InelasticRotationEngine computes is the velocity of the
 *    center of mass of 2 balls. We use the equation described in
 *    https://en.wikipedia.org/wiki/Inelastic_collision#Perfectly_inelastic_collision.
 *
 *  - Using the conservation of Angular Momentum, the InelasticRotationEngine derives the angular velocity (omega) of
 *    the rotation of the balls (relative to the center of mass). See the following links for some general background:
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Discussion
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles
 *      + https://en.wikipedia.org/wiki/Angular_velocity
 *
 *  - Then, on each step of the simulation, the Balls are rotated around the center of mass. The InelasticRotationEngine
 *    changes reference frames to the center of mass of the 2 Balls. From there, standard uniform circular motion
 *    equations are used to compute the new velocity and position of each Ball. See:
 *      + https://en.wikipedia.org/wiki/Frame_of_reference
 *      + https://en.wikipedia.org/wiki/Circular_motion#Uniform_circular_motion
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