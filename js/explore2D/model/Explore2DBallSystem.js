// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DBallSystem is a BallSystem sub-type for the 'Explore 2D' screen.
 *
 * It adds no additional Properties to the super class, but is provided for symmetry in the model-view type hierarchy.
 * It also ensures a correct configuration of initialBallStates.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import Explore2DPlayArea from './Explore2DPlayArea.js';

// constants
const EXPLORE_2D_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1.00, 0.00 ), new Vector2( 1.00, 0.30 ), 0.50 ),
  new BallState( new Vector2( 0.00, 0.50 ), new Vector2( -0.50, -0.50 ), 1.50 ),
  new BallState( new Vector2( -1.00, -0.50 ), new Vector2( -0.50, -0.25 ), 1.00 ),
  new BallState( new Vector2( 0.20, -0.65 ), new Vector2( 1.10, 0.20 ), 1.00 )
];

class Explore2DBallSystem extends BallSystem {

  /**
   * @param {Explore2DPlayArea} playArea
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, options ) {
    assert && assert( playArea instanceof Explore2DPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    super( EXPLORE_2D_INITIAL_BALL_STATES, playArea, elapsedTimeProperty, options );

    assert && assert( EXPLORE_2D_INITIAL_BALL_STATES.length === this.numberOfBallsRange.max );
  }
}

collisionLab.register( 'Explore2DBallSystem', Explore2DBallSystem );
export default Explore2DBallSystem;