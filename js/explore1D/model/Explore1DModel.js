// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import BallState from '../../common/model/BallState.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13
import PlayArea from '../../common/model/PlayArea.js';

// constants
const INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
  new BallState( new Vector2( 0, 0 ), new Vector2( -0.5, 0 ), 1.5 ),
  new BallState( new Vector2( 1, 0 ), new Vector2( -0.5, 0 ), 1.0 ),
  new BallState( new Vector2( 1.5, 0 ), new Vector2( 1.1, 0 ), 1.0 ),
  new BallState( new Vector2( -1.5, 0 ), new Vector2( -1.1, 0 ), 1.0 )
];
assert && assert( _.every( INITIAL_BALL_STATES, ballState => ballState.position.y === 0 && ballState.velocity.y === 0 ) );

class Explore1DModel extends CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( INITIAL_BALL_STATES, tandem, {
      dimensions: 1,
      playAreaBounds: PlayArea.DEFAULT_BOUNDS.erodedY( CollisionLabConstants.PLAY_AREA_1D_ERODED_Y )
    } );

    this.gridVisibleProperty.value = true;
    assert && this.gridVisibleProperty.link( gridVisible => assert( gridVisible, 'grids must be visible in Explore 1D' ) );

    this.pathVisibleProperty.value = false;
    assert && this.pathVisibleProperty.link( pathVisible => assert( !pathVisible, 'paths must be not visible in Explore 1D' ) );
  }
}

collisionLab.register( 'Explore1DModel', Explore1DModel );
export default Explore1DModel;