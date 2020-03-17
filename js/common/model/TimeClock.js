// Copyright 2019-2020, University of Colorado Boulder

/**
 * The clock for this simulation.
 *
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TimeControlSpeed from '../../../../scenery-phet/js/TimeControlSpeed.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constants
const STEP_DURATION = CollisionLabConstants.STEP_DURATION;

class TimeClock {
  /**
   * @param {EnumerationProperty.<TimeControlSpeed>} timeControlSpeedProperty
   */
  constructor( timeControlSpeedProperty ) {

    // @public {Property.<number>} elapsed time (in seconds)
    this.elapsedTimeProperty = new NumberProperty( 0 );

    // @public {Property.<boolean>} timeStep is reversing
    this.isReversingProperty = new BooleanProperty( false );

    // @public {Property.<number>} speedFactor of the simulation: ranging from 1 (normal) to less than one (slow)
    this.speedFactorProperty = new DerivedProperty( [ timeControlSpeedProperty ], speed => {
      return speed === TimeControlSpeed.SLOW ? CollisionLabConstants.SLOW_SPEED_SCALE : CollisionLabConstants.NORMAL_SPEED_SCALE;
    } );
  }

  /**
   * Resets the timeClock
   * @public
   */
  reset() {
    this.elapsedTimeProperty.reset();
    this.isReversingProperty.reset();
  }

  /**
   * Goes one time step back
   * @public
   */
  stepBackward() {
    this.isReversingProperty.value = true;
    this.step( -1 * STEP_DURATION * this.speedFactorProperty.value );
  }

  /**
   * Goes one time step forward
   * @public
   */
  stepForward() {
    this.isReversingProperty.value = false;
    this.step( STEP_DURATION * this.speedFactorProperty.value );
  }

  /**
   * Steps the simulation by dt
   * @public
   * @param  {number} dt
   */
  playStep( dt ) {
    this.isReversingProperty.value = false;
    this.step( dt );
  }

  /**
   * Steps the simulation by dt
   * @public
   * @param  {number} dt
   */
  step( dt ) {
    this.elapsedTimeProperty.value += dt;

    this.stepFunction( dt, this.isReversingProperty.value );
  }

  /**
   * Adds a model time stepper for the simulation
   * @public
   * @param {function} stepFunction(dt,isReversing)
   */
  addTimeStepper( stepFunction ) {
    this.stepFunction = stepFunction;
  }
}

collisionLab.register( 'TimeClock', TimeClock );
export default TimeClock;