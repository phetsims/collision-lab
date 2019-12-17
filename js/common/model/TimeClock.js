// Copyright 2019, University of Colorado Boulder

/**
 * The clock for this simulation.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  const STEP_DURATION = CollisionLabConstants.STEP_DURATION;

  class TimeClock {
    /**
     * @param {Property.<boolean>} isSlowMotionProperty
     */
    constructor( isSlowMotionProperty ) {

      // @public {Property.<number>} elapsed time (in seconds)
      this.elapsedTimeProperty = new NumberProperty( 0 );

      // @public {Property.<boolean>} timeStep is reversing
      this.isReversingProperty = new BooleanProperty( false );

      // @public {Property.<number>} speedFactor of the simulation: ranging from 1 (normal) to less than one (slow)
      this.speedFactorProperty = new DerivedProperty( [isSlowMotionProperty],
        isSlowMotion => isSlowMotion ?
                        CollisionLabConstants.SLOW_SPEED_SCALE : CollisionLabConstants.NORMAL_SPEED_SCALE );

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

  return collisionLab.register( 'TimeClock', TimeClock );
} );