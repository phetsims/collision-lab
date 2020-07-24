// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Explore 2D' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import Explore2DBallSystem from './Explore2DBallSystem.js';
import Explore2DPlayArea from './Explore2DPlayArea.js';

class Explore2DModel extends CollisionLabModel {

  /**
   * Creates the PlayArea for the 'Explore 2D' screen, which uses a screen-specific sub-type of PlayArea. Called in the
   * constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @returns {Explore2DPlayArea}
   */
  createPlayArea() {
    return new Explore2DPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Explore 2D' screen, which uses a screen-specific sub-type of BallSystem. Called in
   * the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {Explore2DPlayArea} playArea
   * @returns {Explore2DBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof Explore2DPlayArea, `invalid playArea: ${playArea}` );

    return new Explore2DBallSystem( playArea );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;