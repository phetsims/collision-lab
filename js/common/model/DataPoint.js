// Copyright 2016-2020, University of Colorado Boulder

/**
 * Immutable data point class that contains information about the position of a generic MovingObject at a given elapsed
 * time of the simulation.
 *
 * Used with both Balls and the CenterOfMass for rendering the path of the MovingObject as time progresses. DataPoints
 * are rendered as a fading line if the 'Path' checkbox is checked, meaning DataPoints are removed after a set amount
 * of time. See https://github.com/phetsims/collision-lab/issues/61.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class DataPoint {

  /**
   * @param {number} time - the total elapsed time of the simulation, in seconds.
   * @param {Vector2} position - position of the MovingObject, in meter coordinates. Should be created with
   *                             Vector2.createFromPool() for memory purposes.
   */
  constructor( time, position ) {
    assert && assert( typeof time === 'number' && time > 0, `invalid time: ${time}` );
    assert && assert( position instanceof Vector2 && CollisionLabConstants.PLAY_AREA_BOUNDS.containsPoint( position ), `invalid position: ${position}` );

    // @public (read-only) {number}
    this.time = time;

    // @public (read-only) {Vector2}
    this.position = position;
  }
}

collisionLab.register( 'DataPoint', DataPoint );
export default DataPoint;