// Copyright 2019-2020, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level model of every screen in the 'Collision Lab' simulation.
 *
 * Mainly responsible for:
 *   - Time Control Properties and stepping the simulation.
 *   - Instantiation of a single PlayArea.
 *   - BallSystem creator abstract method.
 *   - Instantiation of a MomentaDiagram.
 *   - CollisionEngine creator abstract method.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagram from './MomentaDiagram.js';
import PlayArea from './PlayArea.js';

// constants
const TIME_STEP_DURATION = CollisionLabConstants.TIME_STEP_DURATION;

// @abstract
class CollisionLabModel {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    options = merge( {

      // {Object} - passed to the PlayArea instance
      playAreaOptions: null

    }, options );

    //----------------------------------------------------------------------------------------

    // @public {BooleanProperty} - indicates the play/pause state of the screen. Generally manipulated externally
    //                             in the view.
    this.isPlayingProperty = new BooleanProperty( false );

    // @public (read-only) {Property.<number>} - the total elapsed time (in seconds) of the simulation. Set internally.
    this.elapsedTimeProperty = new NumberProperty( 0 );

    // @public {EnumerationProperty.<TimeSpeed>} - indicates the speed rate of the simulation. Set externally in the
    //                                             view.
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed, TimeSpeed.NORMAL );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PlayArea} - create the PlayArea of the screen.
    this.playArea = new PlayArea( options.playAreaOptions );

    // @public (read-only) {BallSystem} - create the BallSystem of the screen.
    this.ballSystem = this.createBallSystem( this.playArea );

    // @public (read-only) {MomentaDiagram} - create the MomentaDiagram model.
    this.momentaDiagram = new MomentaDiagram( this.ballSystem.prepopulatedBalls,
      this.ballSystem.balls,
      this.playArea.dimensions
    );

    // @private {CollisionEngine} - the CollisionEngine of the simulation.
    this.collisionEngine = this.createCollisionEngine( this.playArea, this.ballSystem );

    //----------------------------------------------------------------------------------------

    // Observe when the sim goes from paused to playing to save the states of the Balls in the BallSystem for the next
    // restart() call. Link is never removed and lasts for the lifetime of the simulation.
    this.isPlayingProperty.lazyLink( isPlaying => {
      isPlaying && this.ballSystem.saveBallStates();
    } );

    // Flag that indicates whether the sim was playing before it was programmatically paused.
    let wasPlaying = this.isPlayingProperty.value;

    this.ballSystem.ballSystemUserControlledProperty.link( ballSystemUserControlled => {

      // When the play area is being controlled, the sim is paused and is the play-pause button is disabled.
      // See https://github.com/phetsims/collision-lab/issues/49.
      if ( ballSystemUserControlled ) {

        // save playing state, pause the sim, and disable time controls
        wasPlaying = this.isPlayingProperty.value;
        this.isPlayingProperty.value = false;
      }
      else {

        // enable time controls and restore playing state
        this.isPlayingProperty.value = wasPlaying;
      }
    } );
  }

  /**
   * @abstract
   * Creates the BallSystem for the screen. Called in the constructor of the CollisionLabModel. This is an abstract
   * method because some screens have different initial BallStates and some screens use sub-types of BallSystem, but
   * all screens have a BallSystem.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @returns {BallSystem}
   */
  createBallSystem( playArea ) { assert && assert( false, 'abstract method must be overridden' ); }

  /**
   * @abstract
   * Creates the CollisionEngine for the screen. Called in the constructor of the CollisionLabModel. This is an abstract
   * method because some screens use sub-types of CollisionEngine and have different APIs, but all screens have a
   * CollisionEngine.
   *
   * @protected
   * @param {PlayArea} playArea - the PlayArea instance of the sim.
   * @param {BallSystem} ballSystem - the BallSystem instance of the sim.
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) { assert && assert( false, 'abstract method must be overridden' ); }

  /**
   * Resets the model. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.isPlayingProperty.reset();
    this.elapsedTimeProperty.reset();
    this.timeSpeedProperty.reset();
    this.playArea.reset();
    this.ballSystem.reset();
    this.momentaDiagram.reset();
    this.collisionEngine.reset();
  }

  /**
   * Restarts this model.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.isPlayingProperty.value = false;
    this.elapsedTimeProperty.reset();
    this.ballSystem.restart();
  }

  /**
   * Called when the 'Return Balls' button is pressed.
   * @public
   *
   * Currently, it does the same thing as restarting. See https://github.com/phetsims/collision-lab/issues/90.
   */
  returnBalls(d) { this.restart(); }

  /**
   * Steps the model forward in time. This should only be called directly by Sim.js. Does nothing if the
   * sim is paused.
   * @public
   *
   * @param {number} dt - time since the last step, in seconds.
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    const timeSpeedFactor = this.timeSpeedProperty.value === TimeSpeed.NORMAL ?
                              CollisionLabConstants.NORMAL_SPEED_FACTOR :
                              CollisionLabConstants.SLOW_SPEED_FACTOR;

    this.isPlayingProperty.value && this.stepManual( dt * timeSpeedFactor );
  }

  /**
   * Steps the simulation manually, regardless of whether or not the sim is paused. Intended to be called by clients
   * that step the simulation through step-buttons or used by the main step method when the sim isn't paused.
   * @private
   *
   * @param {number} dt - time delta, in seconds. Should be already scaled to the time speed factor.
   */
  stepManual( dt ) {
    assert && assert( typeof dt === 'number' && dt !== 0, `invalid dt: ${dt}` );

    // Update the elapsedTimeProperty.
    this.elapsedTimeProperty.value += dt;

    this.collisionEngine.step( dt );
  }

  /**
   * Steps the simulation backward by one time-step.
   * @public
   *
   * Called when the user presses the step-backward button.
   */
  stepBackward() {

    // Step backwards by the minimum of one step of the current elapsed time to ensure that elapsed time is positive.
    this.stepManual( -1 * Math.min( TIME_STEP_DURATION, this.elapsedTimeProperty.value ) );
  }

  /**
   * Steps the simulation forward by one time-step.
   * @public
   *
   * Called when the user presses the step-forward button.
   */
  stepForward() { this.stepManual( TIME_STEP_DURATION ); }
}

collisionLab.register( 'CollisionLabModel', CollisionLabModel );
export default CollisionLabModel;