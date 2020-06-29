// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Explore 2D' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13
import Explore2DBallSystem from './Explore2DBallSystem.js';
import Explore2DPlayArea from './Explore2DPlayArea.js';

class Explore2DModel extends CollisionLabModel {

  /**
   * Creates the PlayArea for the 'Explore 2D' screen, which uses a sub-type of PlayArea.
   * @override
   * @protected
   *
   * @returns {Explore2DPlayArea}
   */
  createPlayArea() {
    return new Explore2DPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Explore2D' screen, which uses a sub-type of BallSystem.
   * @override
   * @protected
   *
   * @returns {Explore2DBallSystem}
   */
  createBallSystem() {
    return new Explore2DBallSystem( this.playArea, this.elapsedTimeProperty );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;