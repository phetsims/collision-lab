// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DCollisionEngine is a CollisionEngine sub-type that handles recording the trailing 'Paths' of the Balls
 * in the BallSystem at the exact moment of collision. It uses the `registerExactBallCollision` to record the
 * exact position of a ball when it collides with another ball or with the border.
 *
 * When a collision involving balls occurs, its position and the overlapping time is taken into consideration,
 * and Balls are set to a different position. See CollisionEngine for background. However, this brings up issues for
 * this screen. For instance, Ball Paths in the 'Explore 2D' screen work by recording the position of a Ball.
 * However, Ball positions are never set to the position where the collision actually occurred, and this separation
 * becomes obvious to the user. See https://github.com/phetsims/collision-lab/issues/75.
 *
 * Instead of setting the position of the Ball to the exact collision position, which brought performance issues and
 * doesn't take the overlapping time into consideration of the PathDataPoints, this method is our fix for this issue,
 * which doesn't require a re-rendering of Balls in the view.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
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
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    super( playArea, ballSystem );

    // @private {Property.<number>} - reference to the passed-in elapsedTimeProperty.
    this.elapsedTimeProperty = elapsedTimeProperty;
  }

  /**
   * @override
   * Registers the exact position of a both ball-to-ball collisions and ball-to-border collisions in the respective Ball
   * Paths. See https://github.com/phetsims/collision-lab/issues/75. Also see the super class method declaration for
   * full context and background.
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the exact position of where the Ball collided with the border.
   * @param {number} overlappedTime - the time the Ball has been overlapping the border.
   */
  registerExactBallCollision( ball, collisionPosition, overlappedTime ) {
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