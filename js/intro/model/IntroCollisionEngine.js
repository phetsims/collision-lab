// Copyright 2020, University of Colorado Boulder

/**
 * IntroCollisionEngine is a CollisionEngine sub-type for the 'Intro' screen.
 *
 * When a collision with 2 balls occurs, their positions and the overlapping time is taken into consideration,
 * and Balls are set to a different position. However, for the 'Intro' screen, the 'Change in Momentum' text needs to be
 * positioned above the exact collision point of the balls.
 *
 * Thus, IntroCollisionEngine is responsible for computing the exact contact-point of the 2 Balls of the 'Intro' screen.
 * The contact-point is passed to the IntroBallSystem, which will trigger changes in the change in momentum opacity
 * over time. See https://github.com/phetsims/collision-lab/issues/85. See IntroBallSystem.js and CollisionEngine.js for
 * complete background.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import Ball from '../../common/model/Ball.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';

class IntroCollisionEngine extends CollisionEngine {

  /**
   * Adds the functionality of computing the exact point the Balls collided and passing this information to the
   * IntroBallSystem, if the 'Change in Momentum' vectors are visible. Will call super.handleBallToBallCollision().
   *
   * @override
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   */
  handleBallToBallCollision( ball1, ball2, time ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );

    // Forward the rest of the collision response to the super class.
    super.handleBallToBallCollision( ball1, ball2, time );

    // Only register the 'Change in Momentum' contact point if the 'Change in Momentum' checkbox is checked.
    if ( this.ballSystem.changeInMomentumVisibleProperty.value ) {

      // Reference the normal 'line of impact' vector. See
      // http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf
      // for an image. This is a unit vector.
      const normal = this.mutableVectors.normal;

      // The normal vector points in the direction of ball2. So we scale the normal vector (unit vector) by the radius
      // of ball1 and add it to the center colliding position of ball1 to get the collision-point.
      const contactPoint = normal.times( ball1.radius ).add( ball1.position );

      // The time the collision occurred is the current time of this frame minus how long the Balls have overlapped.
      // const collisionTime = Math.max( this.elapsedTimeProperty.value - dt, 0 );

      // Pass the calculated information to the IntroBallSystem.
      this.ballSystem.registerChangeInMomentumCollision( contactPoint, time );
    }
  }
}

collisionLab.register( 'IntroCollisionEngine', IntroCollisionEngine );
export default IntroCollisionEngine;