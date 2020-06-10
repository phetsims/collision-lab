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

class IntroModel extends CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( tandem, {
      playAreaOptions: {
        dimensions: 1,
        isGridVisibleInitially: true,
        reflectsBorderInitially: false,
        bounds: PlayArea.DEFAULT_BOUNDS.erodedY( CollisionLabConstants.PLAY_AREA_1D_ERODED_Y )
      }
    } );

    //----------------------------------------------------------------------------------------

    assert && this.playArea.gridVisibleProperty.link( gridVisible => assert( gridVisible, 'grids must be visible in Intro' ) );
  }

  /**
   * @override
   * Creates the IntroBallSystem for the 'Explore 1D' screen. Called in the constructor of the super-class. For this screen,
   * this method will instantiate a sub-type of IntroBallSystem: IntroBallSystem. It also has its own custom
   * initial BallStates.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @returns {IntroBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    return new IntroBallSystem( playArea, this.elapsedTimeProperty );
  }

  /**
   * @override
   * Creates the CollisionEngine for the 'Explore 1D' screen. Called in the constructor of the super-class.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @param {IntroBallSystem} ballSystem - the IntroBallSystem instance of the sim.
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof IntroBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new IntroCollisionEngine( this.playArea, this.ballSystem );
  }
}

collisionLab.register( 'IntroModel', IntroModel );
export default IntroModel;