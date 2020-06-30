// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
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
   * @param {Property.<number>} elapsedTimeProperty
   * @returns {InelasticBallSystem}
   */
  createBallSystem( playArea, elapsedTimeProperty ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new InelasticBallSystem( playArea, elapsedTimeProperty );
  }

  /**
   * Creates the CollisionEngine for the 'Inelastic' screen, which uses a screen-specific sub-type of CollisionEngine.
   * Called in the constructor of the super-class, which uses the Factory Method Pattern.
   * @override
   * @protected
   *
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} introBallSystem
   * @param {Property.<number>} elapsedTimeProperty
   * @returns {InelasticCollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    return new InelasticCollisionEngine( playArea, ballSystem, elapsedTimeProperty );
  }
}

collisionLab.register( 'InelasticModel', InelasticModel );
export default InelasticModel;