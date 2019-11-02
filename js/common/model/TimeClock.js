// Copyright 2019, University of Colorado Boulder

/**
 * The clock for this simulation.
 * The simulation time change (dt) on each clock tick is constant,
 * regardless of when (in wall time) the ticks actually happen.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const EventTimer = require( 'PHET_CORE/EventTimer' );
  const Property = require( 'AXON/Property' );

  // constants
  const DEFAULT_DT = CollisionLabConstants.DEFAULT_DT;
  const STEP_DURATION = CollisionLabConstants.STEP_DURATION;

  class TimeClock {
    /**
     *
     * @param {number} baseDTValue (multiplied by scale to obtain true dt)
     * @param {Property.<boolean>} playProperty
     * @param {Property.<boolean>} timeSpeedScaleProperty
     */
    constructor( baseDTValue, playProperty, timeSpeedScaleProperty ) {

      // @private
      this.baseDTValue = baseDTValue;
      this.steppingWhilePausedDT = baseDTValue * CollisionLabConstants.STARTING_SPEED_SCALE;

      // @public
      this.runningProperty = new Property( false );
      this.simulationTimeProperty = new Property( 0 );
      this.dt = baseDTValue * timeSpeedScaleProperty.get();
      this.playProperty = playProperty;

      timeSpeedScaleProperty.link( timeSpeedScale => {
        this.dt = baseDTValue * timeSpeedScale;
      } );
    }

    /**
     * Step the clock while paused, ignoring the current play speed and stepping by DEFAULT_DT.
     *
     * @returns {number}
     */
    stepClockWhilePaused() {

      // See RewindableProperty which has to know whether the clock is running, paused, stepping, rewinding for
      // application specific logic
      this.playProperty.set( true );

      // dt should be scaled by the initial speed when manually stepping
      const clockDT = this.dt; // store to revert after manual step
      this.dt = this.steppingWhilePausedDT;

      this.step( STEP_DURATION );
      this.playProperty.set( false );

      // revert dt to match the play speed
      this.dt = clockDT;
    }

    /**
     * Step the clock while paused, ignoring the current play speed and stepping by 1 / CLOCK_FRAME_RATE.
     *
     * @returns {number}
     */
    stepClockBackWhilePaused() {
      this.playProperty.set( true );

      // dt should be scaled by the initial speed when manually stepping
      const clockDT = this.dt; // store to revert after manual step
      this.dt = this.steppingWhilePausedDT;

      this.step( STEP_DURATION );
      this.playProperty.set( false );


      // revert dt
      this.dt = clockDT;
    }

    /**
     * Set whether or not the model should be running.
     *
     * @param  {boolean} running
     */
    setRunning( running ) {
      this.runningProperty.set( running );
    }

    /**
     * Set the clock time.
     *
     * @param  {number} time description
     */
    setSimulationTime( time ) {
      this.simulationTimeProperty.set( time );
    }

    // @public
    getSimulationTime() {
      return this.simulationTimeProperty.get();
    }

    // @public
    resetSimulationTime() {
      this.simulationTimeProperty.reset();
    }

    /**
     * Add an event callback to the event timer, called every time the animation frame changes.
     *
     * @param  {number} stepFunction
     */
    addEventTimer( stepFunction ) {
      this.eventTimer = new EventTimer( new EventTimer.ConstantEventModel( 1 / DEFAULT_DT ), stepFunction );
    }

    /**
     * Step the simulation by dt
     *
     * @param  {number} dt
     * @returns {type} description
     */
    step( dt ) {
      this.eventTimer.step( dt );
    }

    /**
     * Get the time step for the slowest speed of this clock.  Useful for
     * normalizing time step in the model.
     *
     * @returns {number}
     */
    getSmallestTimeStep() {
      return this.baseDTValue * CollisionLabConstants.SLOW_SPEED_SCALE;
    }
  }

  return collisionLab.register( 'TimeClock', TimeClock );
} );