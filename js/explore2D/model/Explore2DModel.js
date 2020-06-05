// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import PlayArea from '../../common/model/PlayArea.js';
import Explore2DBallSystem from './Explore2DBallSystem.js';
import Explore2DCollisionEngine from './Explore2DCollisionEngine.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13

class Explore2DModel extends CollisionLabModel {

  /**
   * @override
   * Creates the BallSystem for the 'Explore 2D' screen. Called in the constructor of the super-class. For this screen,
   * this method will instantiate a sub-type of BallSystem: Explore2DBallSystem. It also has its own custom
   * initial BallStates.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @returns {Explore2DBallSystem}
   */
  createBallSystem( playArea ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    return new Explore2DBallSystem( playArea );
  }

  /**
   * @override
   * Creates the CollisionEngine for the 'Explore 2D' screen. Called in the constructor of the super-class. For this
   * screen, this method will instantiate a sub-type of CollisionEngine: Explore2DCollisionEngine.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @param {Explore2DBallSystem} ballSystem - the BallSystem instance of the sim.
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof Explore2DBallSystem, `invalid ballSystem: ${ballSystem}` );

    return new Explore2DCollisionEngine( this.playArea, this.ballSystem, this.elapsedTimeProperty );
  }

  /**
   * @override
   * Steps the simulation manually, regardless if the sim is paused. Intended to be called by clients that step the
   * simulation through step-buttons or used by the main step method when the sim isn't paused.
   * @private
   *
   * @param {number} dt - time delta, in seconds. Should be already scaled to the time speed factor.
   */
  stepManual( dt ) {
    assert && assert( typeof dt === 'number' && dt !== 0, `invalid dt: ${dt}` );

    super.stepManual( dt );

    // Update the paths of the Explore2DBallSystem on each step.
    this.ballSystem.updatePaths( this.elapsedTimeProperty.value );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;