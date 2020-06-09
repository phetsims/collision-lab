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
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import PlayArea from '../../common/model/PlayArea.js';

// constants
const EXPLORE_1D_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
  new BallState( new Vector2( 0, 0 ), new Vector2( -0.5, 0 ), 1.5 ),
  new BallState( new Vector2( 1, 0 ), new Vector2( -0.5, 0 ), 1.0 ),
  new BallState( new Vector2( 1.5, 0 ), new Vector2( 1.1, 0 ), 1.0 )
];

class Explore1DBallSystem extends BallSystem {

  /**
   * @param {PlayArea} playArea
   * @param {Object} [options]
   */
  constructor( playArea, options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    super( EXPLORE_1D_INITIAL_BALL_STATES, playArea, options );

    //----------------------------------------------------------------------------------------

    assert && assert( _.every( EXPLORE_1D_INITIAL_BALL_STATES, ballState => {
      return ballState.position.y === 0 && ballState.velocity.y === 0;
    } ), 'balls in explore 1D must have yVelocity and yPosition equal to 0.' );

    assert && assert( EXPLORE_1D_INITIAL_BALL_STATES.length === this.numberOfBallsRange.max );
  }
}

collisionLab.register( 'Explore1DBallSystem', Explore1DBallSystem );
export default Explore1DBallSystem;