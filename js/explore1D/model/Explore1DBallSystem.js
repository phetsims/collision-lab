// Copyright 2020, University of Colorado Boulder

/**
 * Explore1DBallSystem is a BallSystem sub-type for the 'Explore 1D' screen.
 *
 * Although it adds no additional functionality to the super-class, it is added for symmetry within the screen-specific
 * model-view type hierarchy. It also ensures a correct configuration of initialBallStates for 1D and that Balls
 * always have a yPosition and yVelocity of 0.
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

    if ( assert ) {
      assert( EXPLORE_1D_INITIAL_BALL_STATES.length === this.numberOfBallsRange.max );

      assert( EXPLORE_1D_INITIAL_BALL_STATES.every( ballState => ballState.position.y === 0 && ballState.velocity.y === 0 ) );

      this.prepopulatedBalls.forEach( ball => {

        // Ensure that our yPosition and yVelocity are always 0. Link lasts for the lifetime of the sim.
        ball.yVelocityProperty.link( yVelocity => assert( yVelocity === 0 ) );
        ball.yPositionProperty.link( yPosition => assert( yPosition === 0 ) );
      } );
    }
  }
}

collisionLab.register( 'Explore1DBallSystem', Explore1DBallSystem );
export default Explore1DBallSystem;