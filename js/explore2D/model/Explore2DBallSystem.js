// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DBallSystem is a BallSystem sub-type for the 'Explore 2D' screen. See BallSystem for context.
 *
 * Adds the following functionality to BallSystem:
 *   - Tracks the visibility of trailing 'Paths' in a Property.
 *   - Create a Path for all possible Balls.
 *   - Create a Path for the center of mass.
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
  new BallState( new Vector2( -1.00, 0.00 ), new Vector2( 1.00, 0.30 ), 0.50 ),
  new BallState( new Vector2( 0.00, 0.50 ), new Vector2( -0.50, -0.50 ), 1.50 ),
  new BallState( new Vector2( -1.00, -0.50 ), new Vector2( -0.50, -0.25 ), 1.00 ),
  new BallState( new Vector2( 0.20, -0.65 ), new Vector2( 1.10, 0.20 ), 1.00 )
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

    // @public {BooleanProperty} - indicates if the Ball and center of mass trailing paths are visible. This is in the
    //                             model since paths only show the path of the moving object after the visibility
    //                             checkbox is checked and are empty when false.
    this.pathVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {Map.<Ball, CollisionLabPath>} - a Map of a Ball to its associated trailing 'Path'.
    this.ballToPathMap = new Map();

    //----------------------------------------------------------------------------------------

    // Populate the Map. This takes advantage of the prepopulatedBalls, which all Balls in the system must be apart of,
    // by creating a Path of all possible Balls and never having to dispose them. There is no performance loss
    // since Balls not in the BallSystem are not stepped or updated, meaning their paths are not updated.
    this.prepopulatedBalls.forEach( ball => {

      // Map the ball to the a trailing Path.
      this.ballToPathMap.set( ball, new CollisionLabPath(
        ball.positionProperty,
        this.pathVisibleProperty,
        elapsedTimeProperty,
        playArea.bounds
      ) );

      // Observe when the user is controlling the Ball, which clears the trailing 'Path'. Link lasts for the
      // life-time of the sim as Balls are never disposed.
      ball.userControlledProperty.lazyLink( userControlled => {
        userControlled && this.ballToPathMap.get( ball ).clear();
      } );
    } );

    //----------------------------------------------------------------------------------------

    // Get the Property that indicates if the center-of-mass Path is visible, which occurs when both the CenterOfMass
    // and Paths are visible. DerivedProperty is never disposed since Explore2DBallSystems are never disposed.
    const centerOfMassPathVisibleProperty = new DerivedProperty(
      [ this.pathVisibleProperty, this.centerOfMassVisibleProperty ],
      ( centerOfMassVisible, pathVisible ) => centerOfMassVisible && pathVisible, {
        valueType: 'boolean'
      } );

    // @public (read-only) {CollisionLabPath} - the trailing 'Path' behind the center of mass.
    this.centerOfMassPath = new CollisionLabPath(
      this.centerOfMass.positionProperty,
      centerOfMassPathVisibleProperty,
      elapsedTimeProperty,
      playArea.bounds
    );

    //----------------------------------------------------------------------------------------

    // Observe when Balls are removed from the system and clear their trailing Paths. Listener lasts for the life-time
    // of the simulation.
    this.balls.addItemRemovedListener( ball => {
      this.ballToPathMap.get( ball ).clear();
    } );

    // Observe when the user is controlling any of the Balls to clear the trailing Path of the CenterOfMass. See
    // https://github.com/phetsims/collision-lab/issues/61#issuecomment-634404105. Link lasts for the life-time of
    // the sim as PlayAreas are never disposed.
    this.ballSystemUserControlledProperty.lazyLink( ballSystemUserControlled => {
      ballSystemUserControlled && this.centerOfMassPath.clear();
    } );
  }

  /**
   * Resets the Explore2DBallSystem.
   * @public
   * @override
   */
  reset() {

    // Reset Paths first.
    this.pathVisibleProperty.reset();
    this.ballToPathMap.forEach( path => { path.clear(); } );
    this.centerOfMassPath.clear();

    super.reset();
  }

  /**
   * Restarts the Explore2DBallSystem.
   * @public
   * @override
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {

    // Clear the 'Paths' on restart.
    this.ballToPathMap.forEach( path => { path.clear(); } );
    this.centerOfMassPath.clear();

    super.restart();
  }
}

collisionLab.register( 'Explore2DBallSystem', Explore2DBallSystem );
export default Explore2DBallSystem;