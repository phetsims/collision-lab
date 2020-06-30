// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js';
import PlayArea from '../../common/model/PlayArea.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticPlayArea from './InelasticPlayArea.js';

class InelasticModel extends CollisionLabModel {

  /**
   * @public
   */
  createPlayArea() {
    return new InelasticPlayArea();
  }
  /**
   * @override
   * Creates the BallSystem for the 'Inelastic' screen. Called in the constructor of the super-class. For this screen,
   * this method will instantiate a sub-type of BallSystem: InelasticBallSystem. It also has its own custom
   * initial BallStates.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @returns {InelasticBallSystem}
   */
  createBallSystem( playArea, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    return new InelasticBallSystem( playArea, elapsedTimeProperty );
  }

  /**
   * @override
   * Creates the CollisionEngine for the 'Inelastic' screen. Called in the constructor of the super-class.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @param {InelasticBallSystem} ballSystem - the BallSystem instance of the sim.
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem, elapsedTimeProperty ) {
    // assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    // assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new CollisionEngine( this.playArea, this.ballSystem, this.elapsedTimeProperty );
  }
}

collisionLab.register( 'InelasticModel', InelasticModel );
export default InelasticModel;