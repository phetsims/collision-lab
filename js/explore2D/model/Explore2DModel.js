// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13

// constants
const INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1.0, 0.00 ), new Vector2( 1.0, 0.3 ), 0.5 ),
  new BallState( new Vector2( 0.0, 0.50 ), new Vector2( -0.5, -0.5 ), 1.5 ),
  new BallState( new Vector2( -1.0, -0.50 ), new Vector2( -0.5, -0.25 ), 1.0 ),
  new BallState( new Vector2( 0.2, -0.65 ), new Vector2( 1.1, 0.2 ), 1.0 ),
  new BallState( new Vector2( -0.8, 0.65 ), new Vector2( -1.1, 0 ), 1.0 )
];

class Explore2DModel extends CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( INITIAL_BALL_STATES, tandem );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;