// Copyright 2020, University of Colorado Boulder

/**
 * IntroCollisionEngine is a CollisionEngine sub-type.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import PlayArea from '../../common/model/PlayArea.js';
import IntroBallSystem from './IntroBallSystem.js';

class IntroCollisionEngine extends CollisionEngine {

  /**
   * @param {PlayArea} playArea
   * @param {IntroBallSystem} ballSystem
   * @param {Property.<number>} elapsedTimeProperty
   */
  constructor( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof IntroBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    super( playArea, ballSystem );

    // @private {Property.<number>} - reference to the passed-in elapsedTimeProperty.
    this.elapsedTimeProperty = elapsedTimeProperty;
  }


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
    if ( this.ballSystem.changeInMomentumVisibleProperty.value ) {
      const normal = this.mutableVectors.normal;

      const collisionPoint = Vector2.createPolar( ball1.radius, normal.angle ).add( collisionPosition1 );
      this.ballSystem.registerChangeInMomentumCollision( collisionPoint, this.elapsedTimeProperty.value - overlappedTime );
    }
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