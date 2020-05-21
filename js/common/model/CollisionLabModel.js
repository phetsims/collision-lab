// Copyright 2019-2020, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level model of every screen.
 *
 * Mainly responsible for:
 *   - Time Control Properties and stepping the simulation.
 *   - Keep track of the top-level user-manipulation Properties, like the number of Balls or the elasticity.
 *   - Instantiation of a single PlayArea.
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
import PlayArea from './PlayArea.js';

// constants
const STEP_DURATION = CollisionLabConstants.STEP_DURATION;

class CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    // @public (read-only) {BooleanProperty} - indicates the play/pause state of the screen.
    this.playProperty = new BooleanProperty( false );

    // @public {Property.<number>} elapsed time (in seconds) of the screen.
    this.elapsedTimeProperty = new NumberProperty( 0 );

    // @public (read-only) {EnumerationProperty.<TimeSpeed>} - indicates the speed rate of the simulation.
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed, TimeSpeed.NORMAL );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {NumberProperty} - Property of the number of Balls in a system. This Property is manipulated
    //                                        outside of the PlayArea in a Spinner.
    this.numberOfBallsProperty = new NumberProperty( 2 );

    // @public (read-only) {NumberProperty} - Property of the elasticity of all collisions, as a percentage. See
    //                                        https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( 100, { range: CollisionLabConstants.ELASTICITY_PERCENT_RANGE } );

    // @public (read-only) {BooleanProperty} - indicates if the Balls reflect at the Border of the PlayArea bounds.
    //                                         This Property is manipulated outside of the PlayArea.
    this.reflectingBorderProperty = new BooleanProperty( true );

    // @public (read-only) {BooleanProperty} - indicates if Ball radii are constant (i.e. independent of mass).
    //                                         This Property is manipulated outside of the PlayArea.
    this.constantRadiusProperty = new BooleanProperty( false );

    // @public (read-only) {BooleanProperty} - indicates if the grid of the PlayArea is visible. This Property is
    //                                         manipulated outside of the PlayArea. This is placed inside of the model
    //                                         since the visibility of the grid affects the drag-snapping of Balls.
    this.gridVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {BooleanProperty} - determines if the balls are sticky or if they slide on inelastic collisions.
    // TODO: this should be an EnumerationProperty of a Enum (stick vs slide).
    // TODO: what is the state of the design of this feature.
    this.isStickyProperty = new BooleanProperty( true );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PlayArea} - create the PlayArea of the screen.
    this.playArea = new PlayArea(
      this.numberOfBallsProperty,
      this.elasticityPercentProperty,
      this.reflectingBorderProperty,
      this.constantRadiusProperty,
      this.gridVisibleProperty,
      this.isStickyProperty
    );
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.playProperty.reset();
    this.elapsedTimeProperty.reset();
    this.timeSpeedProperty.reset();
    this.numberOfBallsProperty.reset();
    this.elasticityPercentProperty.reset();
    this.reflectingBorderProperty.reset();
    this.constantRadiusProperty.reset();
    this.gridVisibleProperty.reset();
    this.isStickyProperty.reset();
    this.playArea.reset();
  }

  /**
   * Gets the time speed factor, which is set externally by the user and is based off the timeSpeedProperty.
   * @public
   *
   * @returns {number} - the speedFactor, from 1 (normal) to less than one (slow)
   */
  getTimeSpeedFactor() {
    return this.timeSpeedProperty.value === TimeSpeed.NORMAL ?
              CollisionLabConstants.NORMAL_SPEED_SCALE :
              CollisionLabConstants.SLOW_SPEED_SCALE;
  }

  /**
   * Steps the model forward in time. This should only be called directly by Sim.js. Does nothing if the
   * sim is paused.
   * @public
   *
   * @param {number} dt - time since the last step, in seconds.
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    if ( this.playProperty.value ) { this.stepManual( dt * this.getTimeSpeedFactor() ); }
  }

  /**
   * Steps the simulation manually, as regardless if the sim is paused. Intended to be called by clients that step the
   * simulation through step-buttons or used by the main step method when the sim isn't paused.
   * @private
   *
   * @param {number} dt - time delta, in seconds. Should be already scaled to the time speed factor.
   */
  stepManual( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    this.elapsedTimeProperty.value += dt;
    this.playArea.step( dt );
  }

  /**
   * Steps the simulation backward by one time-step.
   * @public
   *
   * Called when the user presses the step-backward button.
   */
  stepBackward() { this.stepManual( -STEP_DURATION * this.getTimeSpeedFactor() ); }

  /**
   * Steps the simulation forward by one time-step.
   * @public
   *
   * Called when the user presses the step-forward button.
   */
  stepForward() { this.stepManual( STEP_DURATION * this.getTimeSpeedFactor() ); }
}

collisionLab.register( 'CollisionLabModel', CollisionLabModel );
export default CollisionLabModel;