// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DCollisionEngine is a CollisionEngine sub-type that handles recording the trailing 'Paths' of the Balls
 * in the BallSystem at the exact moment of collision.
 *
 * It uses the `registerExactBallToBallCollision` and `registerExactBallToBorderCollision` methods to registers the
 * exact position of ball collisions.
 *
 * When a collision involving balls occurs, its position and the overlapping time is taken into consideration,
 * and Balls are set to a different position. See CollisionEngine for background. However, this brings up issues for
 * this screen. For instance, Ball Paths in the 'Explore 2D' screen work by recording the position of a Ball.
 * However, Ball positions are never set to the position where the collision actually occurred, and this separation
 * becomes obvious to the user. See https://github.com/phetsims/collision-lab/issues/75.
 *
 * Instead of setting the position of the Ball to the exact collision position, which brought performance issues, this
 * method is our fix for this issue, which doesn't require a re-rendering of Balls in the view. It is invoked when a
 * collision is detected and passes necessary information to determine when and where a collision occurred.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import Ball from '../../common/model/Ball.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import PlayArea from '../../common/model/PlayArea.js';
import Explore2DBallSystem from './Explore2DBallSystem.js';

class Explore2DCollisionEngine extends CollisionEngine {

  /**
   * @param {PlayArea} playArea
   * @param {Explore2DBallSystem} ballSystem
   * @param {Property.<number>} elapsedTimeProperty
   */
  constructor( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof Explore2DBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && CollisionLabUtils.assertPropertyTypeof( elapsedTimeProperty, 'number' );

    super( playArea, ballSystem );

    // @private {Property.<number>} - reference to the passed-in elapsedTimeProperty.
    this.elapsedTimeProperty = elapsedTimeProperty;
  }

  /**
   * @override
   * Registers the exact position of a ball-to-ball collision in the respective Ball Paths. See
   * https://github.com/phetsims/collision-lab/issues/75.
   * Also see the super class method declaration for full context and background.
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

    // Only record Path's of the Balls if Paths are visible, and the overlapped time is non-zero.
    if ( this.ballSystem.pathVisibleProperty.value &&
        this.elapsedTimeProperty.value - overlappedTime >= 0 &&
        overlappedTime !== 0 ) {

      // Reference the corresponding Paths of the Balls involved in the collision.
      const path1 = this.ballSystem.ballToPathMap.get( ball1 );
      const path2 = this.ballSystem.ballToPathMap.get( ball2 );

      path1.updatePath( collisionPosition1, this.elapsedTimeProperty.value - overlappedTime );
      path2.updatePath( collisionPosition2, this.elapsedTimeProperty.value - overlappedTime );
    }
  }

  /**
   * @override
   * Registers the exact position of a ball-to-border collision in the respective Ball Path. See
   * https://github.com/phetsims/collision-lab/issues/75.
   * Also see the super class method declaration for full context and background.
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the exact position of where the Ball collided with the border.
   * @param {number} overlappedTime - the time the Ball has been overlapping the border.
   */
  registerExactBallToBorderCollision( ball, collisionPosition, overlappedTime ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( collisionPosition instanceof Vector2, `invalid collisionPosition: ${collisionPosition}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    // Only record Path's of the Balls if Paths are visible, and the overlapped time is non-zero.
    if ( this.ballSystem.pathVisibleProperty.value &&
        this.elapsedTimeProperty.value - overlappedTime >= 0 &&
        overlappedTime !== 0 ) {

      // Reference the corresponding Path of the Ball involved in the collision.
      const path = this.ballSystem.ballToPathMap.get( ball );

      path.updatePath( collisionPosition, this.elapsedTimeProperty.value - overlappedTime );
    }
  }
}

collisionLab.register( 'Explore2DCollisionEngine', Explore2DCollisionEngine );
export default Explore2DCollisionEngine;