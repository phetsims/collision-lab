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

class InelasticBallPreset {

  constructor( ballStates ) {


    // @public
    this.ballState = ballStates;
  }

  // @public
  setBallSystem( balls ) {

    this.ballStates.forEach( ( ballState, index ) => {
      balls.get( index ).setState( ballState );
    } );
  }
}

const InelasticBallPresets = Enumeration.byMap( {

  CUSTOM: null,

  NAME_1: new InelasticBallPreset( [
    new BallState( new Vector2( -0.5, 0.00 ), new Vector2( 1.00, 0.5 ), 0.50 ),
    new BallState( new Vector2( 0.5, 0.00 ), new Vector2( -1.00, 0.5 ), 0.5 )
  ] ),
  NAME_2: new InelasticBallPreset( [
    new BallState( new Vector2( -0.5, 0.00 ), new Vector2( 0.5, 0 ), 0.5 ),
    new BallState( new Vector2( 0.5, 0.00 ), new Vector2( -0.5, 0 ), 0.5 )
  ] )
} );

collisionLab.register( 'InelasticBallPresets', InelasticBallPresets );
export default InelasticBallPresets;