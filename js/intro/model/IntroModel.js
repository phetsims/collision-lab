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
   * Creates the PlayArea for the 'Intro' screen, which uses a sub-type of PlayArea.
   * @override
   * @protected
   *
   * @returns {IntroPlayArea}
   */
  createPlayArea() {
    return new IntroPlayArea();
  }

  /**
   * Creates the BallSystem for the 'Intro' screen, which uses a sub-type of BallSystem.
   * @override
   * @protected
   *
   * @returns {IntroBallSystem}
   */
  createBallSystem( playArea, elapsedTimeProperty ) {
    assert && assert( playArea instanceof IntroPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new IntroBallSystem( playArea, elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Intro' screen, which uses a sub-type of CollisionEngine.
   * @override
   * @protected
   *
   * @returns {IntroCollisionEngine}
   */
  createCollisionEngine() {
    return new IntroCollisionEngine( this.playArea, this.ballSystem, this.elapsedTimeProperty );
  }
}

collisionLab.register( 'IntroModel', IntroModel );
export default IntroModel;