// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import PlayArea from '../../common/model/PlayArea.js';
import InelasticBallSystem from './InelasticBallSystem.js';

class InelasticModel extends CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( tandem, {
      playAreaOptions: {
        dimensions: 1,
        isGridVisibleInitially: true,
        bounds: PlayArea.DEFAULT_BOUNDS.erodedY( CollisionLabConstants.PLAY_AREA_1D_ERODED_Y )
      }
    } );

    //----------------------------------------------------------------------------------------

    assert && this.playArea.gridVisibleProperty.link( gridVisible => assert( gridVisible, 'grids must be visible in Inelastic' ) );
  }

  /**
   * @override
   * Creates the BallSystem for the 'Inelastic' screen. Called in the constructor of the super-class. For this screen,
   * this method will instantiate a sub-type of BallSystem: InelasticBallSystem. It also has its own custom
   * initial BallStates.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @returns {InelasticBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    return new InelasticBallSystem( playArea );
  }

  /**
   * @override
   * Creates the CollisionEngine for the 'Inelastic' screen. Called in the constructor of the super-class.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @param {InelasticBallSystem} ballSystem - the BallSystem instance of the sim.
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new CollisionEngine( this.playArea, this.ballSystem );
  }
}

collisionLab.register( 'InelasticModel', InelasticModel );
export default InelasticModel;