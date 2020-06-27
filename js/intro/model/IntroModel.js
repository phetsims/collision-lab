// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
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

    super( tandem, { playAreaOptions: PLAY_AREA_OPTIONS } );

    //----------------------------------------------------------------------------------------

    // Ensure that Grids are always visible for the 'Intro' screen.
    assert && this.playArea.gridVisibleProperty.link( gridVisible => {
      assert( gridVisible, 'Grids must be visible in the Intro screen.' );
    } );
  }

  /**
   * Creates the BallSystem for the 'Intro' screen. Called in the constructor of the super-class. For this screen,
   * this method will instantiate a sub-type of BallSystem: IntroBallSystem.
   *
   * @override
   * @protected
   *
   * @param {PlayArea} playArea - the PlayArea instance of the screen.
   * @param {Property.<number>} elapsedTimeProperty
   * @returns {IntroBallSystem}
   */
  createBallSystem( playArea, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new IntroBallSystem( playArea, elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Intro' screen. Called in the constructor of the super-class. For this
   * screen, this method will instantiate a sub-type of CollisionEngine: IntroCollisionEngine.
   *
   * @override
   * @protected
   *
   * @param {PlayArea} playArea - the PlayArea instance of the screen.
   * @param {IntroBallSystem} ballSystem - the BallSystem instance of the screen.
   * @param {Property.<number>} elapsedTimeProperty
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof IntroBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new IntroCollisionEngine( playArea, ballSystem, elapsedTimeProperty );
  }
}

collisionLab.register( 'IntroModel', IntroModel );
export default IntroModel;