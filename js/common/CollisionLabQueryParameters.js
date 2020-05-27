// Copyright 2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 * Running with ?log will print these query parameters and their values to the console at startup.
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
  }

} );

// Log the values of all sim-specific query parameters
phet.log && phet.log( 'query parameters: ' + JSON.stringify( CollisionLabQueryParameters, null, 2 ) );

collisionLab.register( 'CollisionLabQueryParameters', CollisionLabQueryParameters );
export default CollisionLabQueryParameters;