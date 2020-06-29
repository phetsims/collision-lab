// Copyright 2020, University of Colorado Boulder

/**
 * Explore1DBallSystem is a BallSystem sub-type for the 'Explore 1D' screen.
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
import Explore1DPlayArea from './Explore1DPlayArea.js';

// constants
const EXPLORE_1D_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
  new BallState( new Vector2( 0, 0 ), new Vector2( -0.5, 0 ), 1.5 ),
  new BallState( new Vector2( 1, 0 ), new Vector2( -0.5, 0 ), 1.0 ),
  new BallState( new Vector2( 1.5, 0 ), new Vector2( 1.1, 0 ), 1.0 )
];

class Explore1DBallSystem extends BallSystem {

  /**
   * @param {Explore1DPlayArea} playArea
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, options ) {
    assert && assert( playArea instanceof Explore1DPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    super( EXPLORE_1D_INITIAL_BALL_STATES, playArea, elapsedTimeProperty, options );

    //----------------------------------------------------------------------------------------
    // Ensure that our yPosition and yVelocity are always 0 for 1D screens. Persists for the lifetime of the sim.
    assert && this.playArea.dimensions === 1 && this.yVelocityProperty.link( yVelocity => assert( yVelocity === 0 ) );
    assert && this.playArea.dimensions === 1 && this.yPositionProperty.link( yPosition => assert( yPosition === 0 ) );
    assert && assert( _.every( EXPLORE_1D_INITIAL_BALL_STATES, ballState => {
      return ballState.position.y === 0 && ballState.velocity.y === 0;
    } ), 'balls in explore 1D must have yVelocity and yPosition equal to 0.' );

    assert && assert( EXPLORE_1D_INITIAL_BALL_STATES.length === this.numberOfBallsRange.max );
  }
}

collisionLab.register( 'Explore1DBallSystem', Explore1DBallSystem );
export default Explore1DBallSystem;