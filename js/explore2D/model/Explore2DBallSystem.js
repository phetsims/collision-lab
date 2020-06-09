// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DBallSystem is a BallSystem sub-type for the 'Explore 2D' screen.
 *
 * 'Is a' relationship with BallSystem, but adds:
 *   - Tracking the visibility of trailing 'Paths' in a Property.
 *   - Create a Path for all possible Balls and one for the center of mass.
 *   - Other methods to update and clear Paths when needed.
 *
 * Explore2DBallSystems are created at the start of the sim and are never disposed, so no dispose method is necessary
 * and links are left as-is.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import PlayArea from '../../common/model/PlayArea.js';
import CollisionLabPath from './CollisionLabPath.js';

// constants
const EXPLORE_2D_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1.0, 0.00 ), new Vector2( 1.0, 0.3 ), 0.5 ),
  new BallState( new Vector2( 0.0, 0.50 ), new Vector2( -0.5, -0.5 ), 1.5 ),
  new BallState( new Vector2( -1.0, -0.50 ), new Vector2( -0.5, -0.25 ), 1.0 ),
  new BallState( new Vector2( 0.2, -0.65 ), new Vector2( 1.1, 0.2 ), 1.0 )
];

class Explore2DBallSystem extends BallSystem {

  /**
   * @param {PlayArea} playArea
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );


    super( EXPLORE_2D_INITIAL_BALL_STATES, playArea, options );

    //----------------------------------------------------------------------------------------

    // @public {BooleanProperty} - indicates if the Ball/COM trailing paths are visible. In the model since Ball
    //                             PathDataPoints are only recorded if this is true and are cleared when set to false.
    this.pathVisibleProperty = new BooleanProperty( false );


    // @public (read-only) {Map.<Ball, CollisionLabPath>} - Map prepopulatedBalls to its associated trailing 'Path'.
    this.ballToPathMap = new Map();

    // Populate the Map with Paths.
    this.prepopulatedBalls.forEach( ball => {
      const path = new CollisionLabPath(
        ball.positionProperty,
        this.pathVisibleProperty,
        elapsedTimeProperty,
        playArea.bounds
      );

      this.ballToPathMap.set( ball, path );

      // Observe when the user is finished controlling the Ball, which clears the trailing 'Path'. Link lasts for the
      // life-time of the sim as Balls are never disposed.
      ball.userControlledProperty.lazyLink( userControlled => {
        !userControlled && this.ballToPathMap.get( ball ).clear();
      } );
    } );

    this.balls.lengthProperty.link( () => {
      this.prepopulatedBalls.forEach( ball => {
        !this.balls.contains( ball ) && this.ballToPathMap.get( ball ).clear();
      } );
    } );

    // @public (read-only) {CollisionLabPath} - the trailing 'Path' behind the center of mass.
    this.centerOfMassPath = new CollisionLabPath(
      this.centerOfMass.positionProperty,
      new DerivedProperty(
        [ this.pathVisibleProperty, this.centerOfMassVisibleProperty ],
        ( centerOfMassVisible, pathVisible ) => centerOfMassVisible && pathVisible
      ),
      elapsedTimeProperty,
      playArea.bounds
    );

    //----------------------------------------------------------------------------------------

    // Observe when the user is finished controlling any of the Balls to clear the trailing Path of the CenterOfMass.
    // See https://github.com/phetsims/collision-lab/issues/61#issuecomment-634404105. Link lasts for the life-time of
    // the sim as PlayAreas are never disposed.
    this.ballSystemUserControlledProperty.lazyLink( playAreaUserControlled => {
      !playAreaUserControlled && this.clearCenterOfMassPath();
    } );
  }

  /**
   * @override
   * Resets the Explore2DBallSystem.
   * @public
   */
  reset() {
    super.reset();
    this.pathVisibleProperty.reset();
    this.ballToPathMap.forEach( path => {
      path.clear();
    } );
    this.clearCenterOfMassPath();
  }

  /**
   * @override
   * Restarts the Explore2DBallSystem.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    super.restart();
    this.ballToPathMap.forEach( path => {
      path.clear();
    } );
    this.clearCenterOfMassPath();
  }

  /**
   * Clears the trailing 'Path' of the CenterOfMass.
   * @public
   *
   * Normally called when the user is finished manipulating a Ball. See
   * https://github.com/phetsims/collision-lab/issues/61.
   */
  clearCenterOfMassPath() {
    this.centerOfMassPath.clear();
  }
}

collisionLab.register( 'Explore2DBallSystem', Explore2DBallSystem );
export default Explore2DBallSystem;