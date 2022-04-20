// Copyright 2019-2022, University of Colorado Boulder

/**
 * Abstract class for the top-level model of every screen in the 'Collision Lab' simulation. Should be subclassed for
 * screen-specific fields and sub-classes.
 *
 * Mainly responsible for:
 *   - creation of a PlayArea, BallSystem and CollisionEngine using the Factory Method Pattern.
 *   - instantiation of a MomentaDiagram.
 *   - control of time (play, pause, step, speed).
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallSystem from './BallSystem.js';
import CollisionEngine from './CollisionEngine.js';
import MomentaDiagram from './MomentaDiagram.js';
import PlayArea from './PlayArea.js';

// @abstract
class CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    // @public {Property.<boolean>} - indicates the play/pause state of the screen. Usually manipulated in the view.
    this.isPlayingProperty = new BooleanProperty( false );

    // @public (read-only) {Property.<number>} - the total elapsed time of the simulation, in seconds.
    this.elapsedTimeProperty = new NumberProperty( 0, { isValidValue: value => value >= 0 } );

    // @public the speed rate of the simulation. Set externally in the view.
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PlayArea} - create the PlayArea of the screen.
    this.playArea = this.createPlayArea();

    // @public (read-only) {BallSystem} - create the BallSystem of the screen.
    this.ballSystem = this.createBallSystem( this.playArea );

    // @private {CollisionEngine} - create the CollisionEngine of the screen.
    this.collisionEngine = this.createCollisionEngine( this.playArea, this.ballSystem );

    // @public (read-only) {MomentaDiagram} - create the MomentaDiagram of the screen.
    this.momentaDiagram = new MomentaDiagram(
      this.ballSystem.prepopulatedBalls,
      this.ballSystem.balls,
      this.playArea.dimension
    );

    //----------------------------------------------------------------------------------------

    // Flag that indicates whether the sim was playing before it was programmatically paused.
    let wasPlaying = this.isPlayingProperty.value;

    // Observe when the user manipulates any of the Balls and pause the simulation. If the sim was playing before, the
    // sim is un-paused when the user is finished controlling the Ball. The elapsedTimeProperty is also reset when the
    // user manipulates a Ball. See https://github.com/phetsims/collision-lab/issues/85#issuecomment-650271055.
    this.ballSystem.ballSystemUserControlledProperty.link( ballSystemUserControlled => {
      if ( ballSystemUserControlled ) {

        // If a Ball is being controlled, pause the sim and reset the elapsedTimeProperty.
        wasPlaying = this.isPlayingProperty.value;
        this.isPlayingProperty.value = false;
        this.elapsedTimeProperty.reset();
      }
      else {

        // Restore playing state.
        this.isPlayingProperty.value = wasPlaying;
      }
    } );

    // Reset time when constant-size is toggled, see https://github.com/phetsims/collision-lab/issues/193
    this.ballSystem.ballsConstantSizeProperty.lazyLink( () => {
      this.elapsedTimeProperty.reset();
    } );

    // Reset time when the quantity of balls changes, see
    // https://github.com/phetsims/collision-lab/issues/183#issuecomment-756429346
    this.ballSystem.balls.lengthProperty.lazyLink( () => {
      this.elapsedTimeProperty.reset();
    } );

    // When the elasticity changes, we reset elapsed time to provide proper step-back support.
    // See https://github.com/phetsims/collision-lab/issues/183
    this.playArea.elasticityPercentProperty.lazyLink( elasticity => {
      this.elapsedTimeProperty.reset();
      this.collisionEngine.reset();
    } );
  }

  /**
   * Creates the PlayArea for the screen using the Factory Method Pattern, which allows sub-types to create
   * screen-specific sub-types. Called in CollisionLabModel's constructor.
   *
   * @abstract
   * @protected
   *
   * @returns {PlayArea}
   */
  createPlayArea() { assert && assert( false, 'abstract method must be overridden' ); }

  /**
   * Creates the BallSystem for the screen using the Factory Method Pattern, which allows sub-types to create
   * screen-specific sub-types. Called in CollisionLabModel's constructor.
   *
   * @abstract
   * @protected
   *
   * @param {PlayArea} playArea
   * @returns {BallSystem}
   */
  createBallSystem( playArea ) { assert && assert( false, 'abstract method must be overridden' ); }

  /**
   * Creates the CollisionEngine for the screen using the Factory Method Pattern, which allows sub-types to create
   * screen-specific sub-types, if needed. Called in CollisionLabModel's constructor.
   * @protected
   *
   * @param {PlayArea} playArea
   * @param {BallSystem} ballSystem
   * @returns {CollisionEngine}
   */
  createCollisionEngine( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );

    return new CollisionEngine( playArea, ballSystem );
  }

  //----------------------------------------------------------------------------------------

  /**
   * Resets the screen. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.isPlayingProperty.reset();
    this.elapsedTimeProperty.reset();
    this.timeSpeedProperty.reset();
    this.playArea.reset();
    this.ballSystem.reset();
    this.collisionEngine.reset();
    this.momentaDiagram.reset();
  }

  /**
   * Restarts this screen.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.isPlayingProperty.value = false;
    this.elapsedTimeProperty.reset();
    this.ballSystem.restart();
    this.collisionEngine.reset();
  }

  /**
   * Called when the 'Return Balls' button is pressed.
   * @public
   *
   * Currently, it does the same thing as restarting. See https://github.com/phetsims/collision-lab/issues/90.
   */
  returnBalls() { this.restart(); }

  /**
   * Steps the model forward in time. This should only be called directly by Sim.js. Does nothing if the sim is paused.
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
   * @param {number} dt - time delta, in seconds. Should be already scaled to the time speed factor, if needed.
   */
  stepManual( dt ) {
    assert && assert( typeof dt === 'number' && dt !== 0, `invalid dt: ${dt}` );

    // Step the Physics Engine and update the elapsedTimeProperty value.
    const previousElapsedTime = this.elapsedTimeProperty.value;
    this.elapsedTimeProperty.value += dt;
    this.collisionEngine.step( dt, previousElapsedTime );
  }

  /**
   * Steps the simulation backwards by one time-step.
   * @public
   *
   * Called when the user presses the step-backward button.
   */
  stepBackwards() {

    // Step backwards by the minimum of one step and the current elapsed time to ensure that elapsed time is positive.
    this.stepManual( -1 * Math.min( CollisionLabConstants.TIME_STEP_DURATION, this.elapsedTimeProperty.value ) );
  }

  /**
   * Steps the simulation forwards by one time-step.
   * @public
   *
   * Called when the user presses the step-forward button.
   */
  stepForwards() { this.stepManual( CollisionLabConstants.TIME_STEP_DURATION ); }
}

collisionLab.register( 'CollisionLabModel', CollisionLabModel );
export default CollisionLabModel;