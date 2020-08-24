// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionEngine from './InelasticCollisionEngine.js';
import InelasticPlayArea from './InelasticPlayArea.js';

class InelasticModel extends CollisionLabModel {

  /**
   * Creates the PlayArea for the 'Inelastic' screen, which uses a screen-specific sub-type of PlayArea. Called in the
   * constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @returns {InelasticPlayArea}
   */
  createPlayArea() {
    return new InelasticPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Inelastic' screen, which uses a screen-specific sub-type of BallSystem. Called in
   * the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {InelasticPlayArea} playArea
   * @returns {InelasticBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );

    return new InelasticBallSystem( playArea, this.elapsedTimeProperty, this.isPlayingProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Inelastic' screen, which uses a screen-specific sub-type of CollisionEngine.
   * Called in the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} ballSystem
   * @returns {InelasticCollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new InelasticCollisionEngine( playArea, ballSystem );
  }

  //----------------------------------------------------------------------------------------

  /**
   * Resets the 'Inelastic' screen. Called when the reset-all button is pressed.
   *
   * @override
   * @public
   */
  reset() {
    super.reset();
    this.collisionEngine.reset();
  }

  /**
   * Resets the 'Inelastic' screen.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    super.restart();
    this.collisionEngine.reset();
  }
}

collisionLab.register( 'InelasticModel', InelasticModel );
export default InelasticModel;