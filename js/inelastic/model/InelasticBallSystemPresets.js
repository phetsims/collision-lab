// Copyright 2020, University of Colorado Boulder

/**
 * Enumeration.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';

class InelasticBallSystemPreset {

  constructor( ballState1, ballState2 ) {


    // @public
    this.ballState1 = ballState1;
    this.ballState2 = ballState2;
  }

  // @public
  setBallSystem( ballSystem ) {
    ballSystem.balls.get( 0 ).setState( this.ballState1 );
    ballSystem.balls.get( 1 ).setState( this.ballState2 );
  }
}

const InelasticBallSystemPresets = Enumeration.byMap( {

  CUSTOM: new InelasticBallSystemPreset(
    new BallState( new Vector2( -1.00, 0.00 ), new Vector2( 1.00, 0.30 ), 0.50 ),
    new BallState( new Vector2( 0.00, 0.50 ), new Vector2( -0.50, -0.50 ), 1.50 )
  ),

  NAME_1: new InelasticBallSystemPreset(
    new BallState( new Vector2( -0.5, 0.00 ), new Vector2( 1.00, 0.5 ), 0.50 ),
    new BallState( new Vector2( 0.5, 0.00 ), new Vector2( 1.00, -0.50 ), 0.5 )
  ),

  NAME_2: new InelasticBallSystemPreset(
    new BallState( new Vector2( -0.5, 0.00 ), new Vector2( 0, 0.5 ), 0.5 ),
    new BallState( new Vector2( 0.5, 0.00 ), new Vector2( 0, -0.50 ), 0.5 )
  )
} );

collisionLab.register( 'InelasticBallSystemPresets', InelasticBallSystemPresets );
export default InelasticBallSystemPresets;