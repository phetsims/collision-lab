// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Explore 1D' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import Explore1DBallSystem from './Explore1DBallSystem.js';
import Explore1DPlayArea from './Explore1DPlayArea.js';

class Explore1DModel extends CollisionLabModel {

  /**
   * Creates the PlayArea for the 'Explore1D' screen, which uses a sub-type of PlayArea.
   * @override
   * @protected
   *
   * @returns {Explore1DPlayArea}
   */
  createPlayArea() {
    return new Explore1DPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Explore1D' screen, which uses a sub-type of BallSystem.
   * @override
   * @protected
   *
   * @returns {Explore1DBallSystem}
   */
  createBallSystem() {
    return new Explore1DBallSystem( this.playArea, this.elapsedTimeProperty );
  }
}

collisionLab.register( 'Explore1DModel', Explore1DModel );
export default Explore1DModel;