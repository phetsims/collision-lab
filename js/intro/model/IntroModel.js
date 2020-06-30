// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
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
   * @param {Property.<number>} elapsedTimeProperty
   * @returns {IntroBallSystem}
   */
  createBallSystem( playArea, elapsedTimeProperty ) {
    assert && assert( playArea instanceof IntroPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new IntroBallSystem( playArea, elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Intro' screen, which uses a screen-specific sub-type of CollisionEngine.
   * Called in the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {IntroPlayArea} playArea
   * @param {IntroBallSystem} introBallSystem
   * @param {Property.<number>} elapsedTimeProperty
   * @returns {IntroCollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof IntroPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof IntroBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new IntroCollisionEngine( playArea, ballSystem, elapsedTimeProperty );
  }
}

collisionLab.register( 'IntroModel', IntroModel );
export default IntroModel;