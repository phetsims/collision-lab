// Copyright 2019-2020, University of Colorado Boulder

/**
 * The clock for this simulation.
 *
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constants
const STEP_DURATION = CollisionLabConstants.STEP_DURATION;

class TimeClock {
  /**
   * @param {EnumerationProperty.<TimeSpeed>} timeSpeedProperty
   */
  constructor( timeSpeedProperty ) {

    // @public {Property.<number>} elapsed time (in seconds)
    this.elapsedTimeProperty = new NumberProperty( 0 );

    // @public {Property.<number>} speedFactor of the simulation: ranging from 1 (normal) to less than one (slow)
    this.speedFactorProperty = new DerivedProperty( [ timeSpeedProperty ], speed => {
      return speed === TimeSpeed.SLOW ? CollisionLabConstants.SLOW_SPEED_SCALE : CollisionLabConstants.NORMAL_SPEED_SCALE;
    } );
  }

  /**
   * Resets the timeClock
   * @public
   */
  reset() {
    this.elapsedTimeProperty.reset();
  }

  /**
   * Goes one time step back
   * @public
   */
  stepBackward() {
    this.step( -1 * STEP_DURATION * this.speedFactorProperty.value );
  }

  /**
   * Goes one time step forward
   * @public
   */
  stepForward() {
    this.step( STEP_DURATION * this.speedFactorProperty.value );
  }

  /**
   * Steps the simulation by dt
   * @public
   * @param  {number} dt
   */
  step( dt ) {
    this.elapsedTimeProperty.value += dt;
  }
}

collisionLab.register( 'TimeClock', TimeClock );
export default TimeClock;