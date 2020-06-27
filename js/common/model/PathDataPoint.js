// Copyright 2020, University of Colorado Boulder

/**
 * Immutable data point class that contains information about the position of a generic moving object at a given elapsed
 * time of the simulation.
 *
 * Used with both Balls and the CenterOfMass for rendering the trailing 'Path' of the moving object as time progresses.
 * PathDataPoints are rendered as a fading line if the 'Path' checkbox is checked, meaning PathDataPoints are removed
 * after a set amount of time. See https://github.com/phetsims/collision-lab/issues/61.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';

class PathDataPoint {

  /**
   * @param {number} time - the total elapsed time of the simulation, in seconds.
   * @param {Vector2} position - position of the Ball or CenterOfMass moving object, in meter coordinates.
   */
  constructor( time, position ) {
    assert && assert( typeof time === 'number' && time >= 0, `invalid time: ${time}` );
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );

    // @public (read-only) {number}
    this.time = time;

    // @public (read-only) {Vector2}
    this.position = position;
  }

  /**
   * Debugging string for the PathDataPoint.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `PathDataPoint[ time: ${this.time}, position: ${this.position.toString()} ]`;
  }
}

collisionLab.register( 'PathDataPoint', PathDataPoint );
export default PathDataPoint;