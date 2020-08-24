// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import IntroBallSystem from './IntroBallSystem.js';
import IntroCollisionEngine from './IntroCollisionEngine.js';
import IntroPlayArea from './IntroPlayArea.js';

class IntroModel extends CollisionLabModel {

  /**
   * Creates the PlayArea for the 'Intro' screen, which uses a screen-specific sub-type of PlayArea. Called in the
   * constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @returns {IntroPlayArea}
   */
  createPlayArea() {
    return new IntroPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Intro' screen, which uses a screen-specific sub-type of BallSystem. Called in
   * the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {IntroPlayArea} playArea
   * @returns {IntroBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof IntroPlayArea, `invalid playArea: ${playArea}` );

    return new IntroBallSystem( playArea, this.elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Intro' screen, which uses a screen-specific sub-type of CollisionEngine.
   * Called in the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {IntroPlayArea} playArea
   * @param {IntroBallSystem} ballSystem
   * @returns {IntroCollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof IntroPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof IntroBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new IntroCollisionEngine( playArea, ballSystem );
  }
}

collisionLab.register( 'IntroModel', IntroModel );
export default IntroModel;