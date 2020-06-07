// Copyright 2020, University of Colorado Boulder

/**
 * IntroBallSystem is a BallSystem sub-type for the 'Explore 1D' screen.
 *
 * It adds no additional Properties to the super class, but is provided for symmetry in the model-view type hierarchy.
 * It also ensures a correct configuration of initialBallStates.
 *
 * @author Brandon Li
 */

import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import PlayArea from '../../common/model/PlayArea.js';

// constants
const INTRO_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
  new BallState( new Vector2( 0, 0 ), new Vector2( -0.5, 0 ), 1.5 )
];

class IntroBallSystem extends BallSystem {

  /**
   * @param {PlayArea} playArea
   * @param {Object} [options]
   */
  constructor( playArea, options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      numberOfBallsRange: new RangeWithValue( 2, 2, 2 )

    }, options );

    super( INTRO_INITIAL_BALL_STATES, playArea, options );

    //----------------------------------------------------------------------------------------


  }
}

collisionLab.register( 'IntroBallSystem', IntroBallSystem );
export default IntroBallSystem;