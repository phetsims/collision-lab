// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Explore 2D' screen.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Explore2DBallSystem from './Explore2DBallSystem.js';
import Explore2DPlayArea from './Explore2DPlayArea.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13

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
  createBallSystem( playArea, elapsedTimeProperty ) {
    assert && assert( playArea instanceof Explore2DPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new Explore2DBallSystem( playArea, elapsedTimeProperty );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;