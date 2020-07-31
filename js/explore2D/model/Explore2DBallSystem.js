// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DBallSystem is a BallSystem sub-type for the 'Explore 2D' screen.
 *
 * Although it adds no additional functionality to the super-class, it is added for symmetry within the screen-specific
 * model-view type hierarchy. It also verifies a correct configuration of initialBallStates for 2D and gives the
 * initial BallStates for the Explore 2D screen.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import Explore2DPlayArea from './Explore2DPlayArea.js';

// constants
// const EXPLORE_2D_INITIAL_BALL_STATES = [
//   new BallState( new Vector2( -1.0, 0.000 ), new Vector2( 1.00, 0.300 ), 0.50 ),
//   new BallState( new Vector2( 0.00, 0.500 ), new Vector2( -0.5, -0.50 ), 1.50 ),
//   new BallState( new Vector2( -1.0, -0.50 ), new Vector2( -0.5, -0.25 ), 1.00 ),
//   new BallState( new Vector2( 0.20, -0.65 ), new Vector2( 1.10, 0.200 ), 1.00 )
// ];

const EXPLORE_2D_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -0.5, 0.000 ), new Vector2( 0.5, 0 ), 0.50 ),
  new BallState( new Vector2( 0.00, 0.500 ), new Vector2( 0, -0.50 ), 0.5 ),
  new BallState( new Vector2( 0, -0.50 ), new Vector2( 0, 0.5 ), 0.5 ),
  new BallState( new Vector2( 0.20, -0.65 ), new Vector2( 1.10, 0.200 ), 1.00 )
];

class Explore2DBallSystem extends BallSystem {

  /**
   * @param {Explore2DPlayArea} playArea
   * @param {Object} [options]
   */
  constructor( playArea, options ) {
    assert && assert( playArea instanceof Explore2DPlayArea, `invalid playArea: ${playArea}` );

    super( EXPLORE_2D_INITIAL_BALL_STATES, playArea, options );

    //----------------------------------------------------------------------------------------

    // Verify a correct configuration of Balls that conforms to the invariants for 2D screens, but bury behind assert
    // so it doesn't impact production performance.
    if ( assert ) {

      // Verify that the correct number of BallStates were provided.
      assert( EXPLORE_2D_INITIAL_BALL_STATES.length === this.numberOfBallsRange.max );

      // Verify that the position of BallStates were inside the PlayArea's bounds.
      assert( EXPLORE_2D_INITIAL_BALL_STATES.every( ballState => playArea.bounds.containsPoint( ballState.position ) ) );
    }
  }
}

collisionLab.register( 'Explore2DBallSystem', Explore2DBallSystem );
export default Explore2DBallSystem;