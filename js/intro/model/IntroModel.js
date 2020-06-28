// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import PlayArea from '../../common/model/PlayArea.js';
import IntroBallSystem from './IntroBallSystem.js';
import IntroCollisionEngine from './IntroCollisionEngine.js';

// constants
const PLAY_AREA_OPTIONS = {
  dimensions: 1,
  isGridVisibleInitially: true,
  reflectsBorderInitially: false,
  bounds: PlayArea.DEFAULT_BOUNDS.erodedY( CollisionLabConstants.PLAY_AREA_1D_ERODED_Y )
};

class IntroModel extends CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( tandem );

    //----------------------------------------------------------------------------------------

    // Ensure that Grids are always visible for the 'Intro' screen.
    assert && this.playArea.gridVisibleProperty.link( gridVisible => {
      assert( gridVisible, 'Grids must be visible in the Intro screen.' );
    } );
  }

  /**
   * Creates the PlayArea for the 'Intro' screen, which uses a sub-type of PlayArea.
   * @override
   * @protected
   *
   * @returns {PlayArea}
   */
  createPlayArea() { return new PlayArea( PLAY_AREA_OPTIONS ); }

  /**
   * Creates the BallSystem for the 'Intro' screen, which uses a sub-type of BallSystem.
   * @override
   * @protected
   *
   * @returns {IntroBallSystem}
   */
  createBallSystem() {
    return new IntroBallSystem( this.playArea, this.elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Intro' screen, which uses a sub-type of CollisionEngine.
   * @override
   * @protected
   *
   * @returns {IntroCollisionEngine}
   */
  createCollisionEngine() {
    return new IntroCollisionEngine( this.playArea, this.ballSystem, this.elapsedTimeProperty );
  }
}

collisionLab.register( 'IntroModel', IntroModel );
export default IntroModel;