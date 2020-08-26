// Copyright 2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Brandon Li
 */

import collisionLab from '../collisionLab.js';

const CollisionLabQueryParameters = QueryStringMachine.getAll( {

  /**
   * The max life-time of recorded PathDataPoints along the trailing 'Path' of the Center of Mass and the Balls when the
   * 'Path' Checkbox is checked.
   *
   * See https://github.com/phetsims/collision-lab/issues/61.
   * For internal use only.
   */
  pathPointLifetime: {
    type: 'number',
    isValidValue: value => ( value > 0 ),
    defaultValue: 3
  },

  /**
   * The max time period that the 'Change in Momentum' Vectors are FULLY opaque in the 'Intro' screen.
   *
   * See https://github.com/phetsims/collision-lab/issues/85.
   * For internal use only.
   */
  changeInMomentumVisiblePeriod: {
    type: 'number',
    isValidValue: value => ( value >= 0 ),
    defaultValue: 0.5
  },

  /**
   * The max time period that the 'Change In Momentum' Vectors linearly fade in opacity in the 'Intro' screen, after the
   * CollisionLabQueryParameters.changeInMomentumVisiblePeriod is over.
   *
   * See https://github.com/phetsims/collision-lab/issues/85.
   * For internal use only.
   */
  changeInMomentumFadePeriod: {
    type: 'number',
    isValidValue: value => ( value >= 0 ),
    defaultValue: 0.5
  },

  /**
   * The seconds of real time per each press of the Step button. Used for simulating low frame rate devices in
   * https://github.com/phetsims/collision-lab/issues/117.
   *
   * For internal use only.
   */
  timeStepDuration: {
    type: 'number',
    defaultValue: 0.01,
    isValidValue: value => ( value > 0 )
  }
} );

collisionLab.register( 'CollisionLabQueryParameters', CollisionLabQueryParameters );
export default CollisionLabQueryParameters;