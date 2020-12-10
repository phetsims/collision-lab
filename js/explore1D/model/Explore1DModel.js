// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Explore 1D' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import Explore1DBallSystem from './Explore1DBallSystem.js';
import Explore1DCollisionEngine from './Explore1DCollisionEngine.js';
import Explore1DPlayArea from './Explore1DPlayArea.js';

class Explore1DModel extends CollisionLabModel {

  /**
   * Creates the PlayArea for the 'Explore 1D' screen, which uses a screen-specific sub-type of PlayArea. Called in the
   * constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @returns {Explore1DPlayArea}
   */
  createPlayArea() {
    return new Explore1DPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Explore 1D' screen, which uses a screen-specific sub-type of BallSystem. Called in
   * the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {Explore1DPlayArea} playArea
   * @returns {Explore1DBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof Explore1DPlayArea, `invalid playArea: ${playArea}` );

    return new Explore1DBallSystem( playArea );
  }

  /**
   * Creates the CollisionEngine for the 'Inelastic' screen, which uses a screen-specific sub-type of CollisionEngine.
   * Called in the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {Explore1DPlayArea} playArea
   * @param {Explore1DBallSystem} ballSystem
   * @returns {Explore1DCollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof Explore1DPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof Explore1DBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new Explore1DCollisionEngine( playArea, ballSystem );
  }
}

collisionLab.register( 'Explore1DModel', Explore1DModel );
export default Explore1DModel;