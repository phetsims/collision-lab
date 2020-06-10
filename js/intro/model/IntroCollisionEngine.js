// Copyright 2020, University of Colorado Boulder

/**
 * IntroCollisionEngine is a CollisionEngine sub-type.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';

class IntroCollisionEngine extends CollisionEngine {

  /**
   * Registers the exact position of a ball-to-ball collision by recording the exact collision position in the
   * respective Ball paths. See https://github.com/phetsims/collision-lab/issues/75 and the super class method
   * declaration for full context and background.
   *
   * @override
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {Vector2} collisionPosition1 - the exact position of where the first Ball collided with the second Ball.
   * @param {Vector2} collisionPosition2 - the exact position of where the second Ball collided with the first Ball.
   * @param {number} overlappedTime - the time the two Balls have been overlapping each other.
   */
  registerExactBallToBallCollision( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime ) {
    const normal = this.mutableVectors.normal;

    const collisionPoint = Vector2.createPolar( ball1.radius, normal.angle ).add( collisionPosition1 );
    this.ballSystem.registerBallCollision( collisionPoint, overlappedTime );
  }

  /**
   * @override
   * Registers the exact position of a ball-to-border collision by recording the exact collision position in the
   * colliding Ball's path. See https://github.com/phetsims/collision-lab/issues/75 and the super class method
   * declaration for full context and background.
   *
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the exact position of where the Ball collided with the border.
   * @param {number} overlappedTime - the time the Ball has been overlapping the border.
   */
  registerExactBallToBorderCollision( ball, collisionPosition, overlappedTime ) {
    assert && assert( false );
  }
}

collisionLab.register( 'IntroCollisionEngine', IntroCollisionEngine );
export default IntroCollisionEngine;