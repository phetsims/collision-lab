// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Explore 2D' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13
import PlayArea from '../../common/model/PlayArea.js';
import Explore2DBallSystem from './Explore2DBallSystem.js';
import Explore2DCollisionEngine from './Explore2DCollisionEngine.js';

class Explore2DModel extends CollisionLabModel {

  /**
   * Creates the BallSystem for the 'Explore 2D' screen. Called in the constructor of the super-class. For this screen,
   * this method will instantiate a sub-type of BallSystem: Explore2DBallSystem.
   *
   * @override
   * @protected
   *
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @returns {Explore2DBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    return new Explore2DBallSystem( playArea, this.elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Explore 2D' screen. Called in the constructor of the super-class. For this
   * screen, this method will instantiate a sub-type of CollisionEngine: Explore2DCollisionEngine.
   *
   * @override
   * @protected
   *
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @param {Explore2DBallSystem} ballSystem - the BallSystem instance of the sim.
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof Explore2DBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new Explore2DCollisionEngine( this.playArea, this.ballSystem, this.elapsedTimeProperty );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;