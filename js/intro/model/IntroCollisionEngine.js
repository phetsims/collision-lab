// Copyright 2020, University of Colorado Boulder

/**
 * IntroCollisionEngine is a CollisionEngine sub-type that handles computing the exact point two balls collided,
 * calculating exactly when the collision occurred (in between frames), and passing this information to the
 * IntroBallSystem. See IntroBallSystem.js and CollisionEngine.js for background.
 *
 * When a collision with 2 balls occurs, its position and the overlapping time is taken into consideration,
 * and Balls are set to a different position. However, for the 'Intro' screen, the 'Change in Momentum' text needs to be
 * positioned above the exact collision point of the balls. Thus, when a collision is detected, this exact colliding
 * point needs to be computed and passed to the IntroBallSystem, which will trigger changes in the change in momentum
 * opacity over time. See https://github.com/phetsims/collision-lab/issues/85.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from '../../common/model/Ball.js';
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
   * Registers the exact position of a ball-to-ball collision by computing the exact point the Balls collided and
   * passing this information to the IntroBallSystem if the 'Change in Momentum' vectors are visible.
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
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( collisionPosition1 instanceof Vector2, `invalid collisionPosition1: ${collisionPosition1}` );
    assert && assert( collisionPosition2 instanceof Vector2, `invalid collisionPosition2: ${collisionPosition2}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    // Only register the 'Change in Momentum' collision point if the 'Change in Momentum' vectors checkbox is checked.
    if ( this.ballSystem.changeInMomentumVisibleProperty.value ) {

      // Reference the normal 'line of impact' vector. See
      // http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf
      // for an image.
      const normal = this.mutableVectors.normal;

      // The normal vector points in the direction of ball2. So we scale the normalized normal vector by the radius
      // of ball1 and add it to the center colliding position of ball1 to get the collision-point.
      const collisionPoint = normal.times( ball1.radius ).add( collisionPosition1 );

      // The time the collision occurred is the current time of this frame minus how long the Balls have overlapped.
      const collisionTime = Math.max( this.elapsedTimeProperty.value - overlappedTime, 0 );

      // Pass the calculated information to the IntroBallSystem.
      this.ballSystem.registerChangeInMomentumCollision( collisionPoint, collisionTime );
    }
  }

  /**
   * Registers the exact position of a ball-to-border collision. Overriden to ensure that there are no ball-to-border
   * collisions in the 'Intro' screen, since the PlayArea's border doesn't reflect.
   * @override
   * @protected
   *
   * @param {Ball} ball
   * @param {Vector2} collisionPosition
   * @param {number} overlappedTime
   */
  registerExactBallToBorderCollision( ball, collisionPosition, overlappedTime ) {
    assert && assert( false, 'There are no Ball to Border collisions in the Intro screen' );
  }
}

collisionLab.register( 'IntroCollisionEngine', IntroCollisionEngine );
export default IntroCollisionEngine;