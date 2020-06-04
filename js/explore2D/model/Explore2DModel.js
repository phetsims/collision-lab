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
import Explore2DBallSystem from './Explore2DBallSystem.js';
import Explore2DCollisionEngine from './Explore2DCollisionEngine.js';

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

  createCollisionEngine( playArea, ballSystem ) {
    return new Explore2DCollisionEngine( this.playArea, this.ballSystem, this.elapsedTimeProperty );
  }

  createBallSystem( initialBallStates, playArea ) {
    return new Explore2DBallSystem( INITIAL_BALL_STATES, playArea );
  }
  /**
   * @override
   * Steps the simulation manually, regardless if the sim is paused. Intended to be called by clients that step the
   * simulation through step-buttons or used by the main step method when the sim isn't paused.
   * @private
   *
   * @param {number} dt - time delta, in seconds. Should be already scaled to the time speed factor.
   */
  stepManual( dt ) {
    assert && assert( typeof dt === 'number' && dt !== 0, `invalid dt: ${dt}` );

    super.stepManual( dt );

    this.ballSystem.updatePaths( this.elapsedTimeProperty.value );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;