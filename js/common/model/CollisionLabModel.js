// Copyright 2019-2020, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level model of every screen in the 'Collision Lab' simulation.
 *
 * Mainly responsible for:
 *   - Time Control Properties and stepping the simulation.
 *   - Keep track of the top-level user-manipulation Properties, like the number of Balls or the elasticity.
 *   - Instantiation of a single PlayArea.
 *   - Instantiation of the CollisionDetector collision engine.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import isArray from '../../../../phet-core/js/isArray.js';
import merge from '../../../../phet-core/js/merge.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallState from './BallState.js';
import CollisionDetector from './CollisionDetector.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';
import MomentaDiagram from './MomentaDiagram.js';
import PlayArea from './PlayArea.js';

// constants
const TIME_STEP_DURATION = CollisionLabConstants.TIME_STEP_DURATION;

class CollisionLabModel {

  /**
   * @param {BallState[]} initialBallStates - the initial BallStates of ALL possible Balls in the system.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( initialBallStates, tandem, options ) {

    options = merge( {

      // {number} - the dimensions of the collision Screen. Either 1 or 2.
      dimensions: 2,

      // {RangeWithValue} - the range of the number of Balls in the Screen.
      numberOfBallsRange: new RangeWithValue( 1, 5, 2 ),

      // {Bounds2} - the model bounds of the PlayArea, in meters.
      playAreaBounds: PlayArea.DEFAULT_BOUNDS

    }, options );

    assert && assert( isArray( initialBallStates ) && _.every( initialBallStates, ballState => ballState instanceof BallState ), `invalid initialBallStates: ${ initialBallStates }` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );
    assert && assert( options.dimensions === 1 || options.dimensions === 2, `invalid options.dimensions: ${ options.dimensions }` );
    assert && assert( options.numberOfBallsRange instanceof RangeWithValue, `invalid options.numberOfBallsRange: ${options.numberOfBallsRange}` );
    assert && assert( options.dimensions === 2 || _.every( initialBallStates, ballState => ballState.position.y === 0 && ballState.velocity.y === 0 ) );

    // @public (read-only) {number} - reference to the number of dimensions for this collision Screen.
    this.dimensions = options.dimensions;

    // @public (read-only) {Range} - reference to the range of the number of balls.
    this.numberOfBallsRange = options.numberOfBallsRange;

    //----------------------------------------------------------------------------------------

    // @public (read-only) {BooleanProperty} - indicates the play/pause state of the screen.
    this.playProperty = new BooleanProperty( false );

    // @public {Property.<number>} elapsed time (in seconds) of the screen.
    this.elapsedTimeProperty = new NumberProperty( 0 );

    // @public (read-only) {EnumerationProperty.<TimeSpeed>} - indicates the speed rate of the simulation.
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed, TimeSpeed.NORMAL );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {NumberProperty} - Property of the number of Balls in a system. This Property is manipulated
    //                                        outside of the PlayArea in a Spinner.
    this.numberOfBallsProperty = new NumberProperty( options.numberOfBallsRange.defaultValue, {
      numberType: 'Integer',
      range: options.numberOfBallsRange
    } );

    // @public (read-only) {NumberProperty} - Property of the elasticity of all collisions, as a percentage. See
    //                                        https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( CollisionLabConstants.ELASTICITY_PERCENT_RANGE.defaultValue, {
      range: CollisionLabConstants.ELASTICITY_PERCENT_RANGE
    } );

    // @public (read-only) {BooleanProperty} - indicates if the Ball/COM trailing paths are visible. In the model since
    //                                         Ball PathDataPoints are only recorded if this is true and are cleared when
    //                                         set to false.
    this.pathVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {BooleanProperty} - indicates if the center of mass is visible. This is in the model since
    //                                         CenterOfMass PathDataPoints are only recorded if this is true and are
    //                                         cleared when set to false.
    this.centerOfMassVisibleProperty = new BooleanProperty( false );

    //----------------------------------------------------------------------------------------

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

    // @public {EnumerationProperty.<InelasticCollisionTypes} - the type of collision for perfectly inelastic collisions
    this.inelasticCollisionTypeProperty = new EnumerationProperty( InelasticCollisionTypes,
      InelasticCollisionTypes.STICK );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PlayArea} - create the PlayArea of the screen.
    this.playArea = new PlayArea(
      initialBallStates,
      this.numberOfBallsProperty,
      this.constantRadiusProperty,
      this.gridVisibleProperty,
      this.pathVisibleProperty,
      this.centerOfMassVisibleProperty, {
        dimensions: options.dimensions,
        bounds: options.playAreaBounds
      } );

    // @private {CollisionDetector} - the CollisionDetector of the simulation, which acts as the physics engine.
    this.collisionDetector = new CollisionDetector(
      this.playArea.balls,
      this.playArea.bounds,
      this.elasticityPercentProperty,
      this.reflectingBorderProperty,
      this.inelasticCollisionTypeProperty,
      this.pathVisibleProperty,
      this.elapsedTimeProperty
    );

    // @public (read-only) {MomentaDiagram}
    this.momentaDiagram = new MomentaDiagram( this.playArea.prepopulatedBalls, this.playArea.balls, {
      dimensions: options.dimensions
    } );

    // Observe when the sim goes from paused to playing to save the states of the Balls in the PlayArea for the next
    // restart() call. Link is never removed and lasts for the lifetime of the simulation.
    this.playProperty.lazyLink( play => {
      if ( play ) { this.playArea.saveBallStates(); }
    } );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.playProperty.reset();
    this.elapsedTimeProperty.reset();
    this.timeSpeedProperty.reset();
    this.numberOfBallsProperty.reset();
    this.elasticityPercentProperty.reset();
    this.pathVisibleProperty.reset();
    this.centerOfMassVisibleProperty.reset();
    this.reflectingBorderProperty.reset();
    this.constantRadiusProperty.reset();
    this.gridVisibleProperty.reset();
    this.inelasticCollisionTypeProperty.reset();
    this.playArea.reset();
    this.momentaDiagram.reset();
  }

  /**
   * Restarts this model.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.playProperty.value = false;
    this.elapsedTimeProperty.reset();
    this.playArea.restart();
  }

  /**
   * Gets the time speed factor, which is set externally by the user and is based off the timeSpeedProperty.
   * @public
   *
   * @returns {number} - the speedFactor, from 1 (normal) to less than one (slow)
   */
  getTimeSpeedFactor() {
    return this.timeSpeedProperty.value === TimeSpeed.NORMAL ?
              CollisionLabConstants.NORMAL_SPEED_FACTOR :
              CollisionLabConstants.SLOW_SPEED_FACTOR;
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

    /**
     * The position of the balls are:
     * (1) updated based on the ballistic motion of individual balls
     * (2) corrected through collisionDetector, to take into account collisions between balls and walls
     */
    this.playArea.step( dt );
    this.collisionDetector.step( dt );

    if ( this.pathVisibleProperty.value ) {
      this.playArea.updatePaths( this.elapsedTimeProperty.value );
    }
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