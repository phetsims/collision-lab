// Copyright 2020, University of Colorado Boulder

/**
 * Explore1DBallSystem is a BallSystem sub-type for the 'Explore 1D' screen.
 *
 * Although it adds no additional functionality to the super-class, it is added for symmetry within the screen-specific
 * model-view type hierarchy. It also verifies a correct configuration of initialBallStates for 1D and that Balls
 * always have a yPosition and yVelocity of 0.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import Explore1DPlayArea from './Explore1DPlayArea.js';

// constants
const EXPLORE_1D_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1.0, 0 ), new Vector2( 1.00, 0 ), 0.5 ),
  new BallState( new Vector2( 0.00, 0 ), new Vector2( -0.5, 0 ), 1.5 ),
  new BallState( new Vector2( 1.00, 0 ), new Vector2( -0.5, 0 ), 1.0 ),
  new BallState( new Vector2( 1.50, 0 ), new Vector2( 1.10, 0 ), 1.0 )
];
// const EXPLORE_1D_INITIAL_BALL_STATES = [
//   new BallState( new Vector2( -0.46, 0 ), new Vector2( -0.13, 0 ), 0.5 ),
//   new BallState( new Vector2( -0.09, 0 ), new Vector2( -0.13, 0 ), 1.5 ),
//   new BallState( new Vector2( 1.00, 0 ), new Vector2( -2.25, 0 ), 1.0 ),
//   new BallState( new Vector2( 1.50, 0 ), new Vector2( 1.10, 0 ), 1.0 )
// ];


class Explore1DBallSystem extends BallSystem {

  /**
   * @param {Explore1DPlayArea} playArea
   * @param {Object} [options]
   */
  constructor( playArea, options ) {
    assert && assert( playArea instanceof Explore1DPlayArea, `invalid playArea: ${playArea}` );

    super( EXPLORE_1D_INITIAL_BALL_STATES, playArea, options );

    //----------------------------------------------------------------------------------------

    // Verify that the configuration of Balls conforms to the invariants for 1D screens, but bury behind assert so it
    // doesn't impact production performance.
    if ( assert ) {

      // Verify that the correct number of BallStates were provided.
      assert( EXPLORE_1D_INITIAL_BALL_STATES.length === this.numberOfBallsRange.max );

      // Verify that every Ball's yPosition and yVelocity is always 0. Links lasts for the lifetime of the sim.
      this.prepopulatedBalls.forEach( ball => {

        ball.yVelocityProperty.link( yVelocity => assert( yVelocity === 0 ), 'yVelocity must be 0 for Explore 1D' );
        ball.yPositionProperty.link( yPosition => assert( yPosition === 0 ), 'yPosition must be 0 for Explore 1D' );
      } );

      // Verify that Paths are never visible for the 'Explore 1D' screen.
      this.pathsVisibleProperty.link( pathVisible => assert( !pathVisible ) );
    }
  }
}

collisionLab.register( 'Explore1DBallSystem', Explore1DBallSystem );
export default Explore1DBallSystem;