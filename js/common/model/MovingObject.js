// Copyright 2019-2020, University of Colorado Boulder

/**
 * MovingObject is a abstract class for objects that move, including Balls and the CenterOfMass. It is abstract and
 * intended to be subclassed.
 *
 * Its main responsibility is to keep track of DataPoints within a set time period of the MovingObject. This is used
 * to render the path of the MovingObject as time progresses, which appears if the 'Path' checkbox is checked. It will
 * remove DataPoints that are past the set time period, which allows the 'Path' to fade over time.
 * See https://github.com/phetsims/collision-lab/issues/61.
 *
 * @author Brandon Li
 */

import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../CollisionLabQueryParameters.js';
import DataPoint from './DataPoint.js';

// constants
const PATH_DATA_POINT_LIFETIME = CollisionLabQueryParameters.pathPointLifetime;

class MovingObject {

  /**
   * @abstract
   */
  constructor() {

    // @public (read-only) {DataPoint[]} - the recorded points of the path trail of the MovingObject within a given
    //                                     time period, which is PATH_DATA_POINT_LIFETIME seconds.
    this.dataPoints = [];
  }

  /**
   * @abstract
   * Gets the position of the MovingObject, in meter coordinates.
   * @public
   *
   * @returns {Vector2} - in meter coordinates
   */
  get position() { throw new Error( '`get position` must be implemented by subclass' ); }

  /**
   * Updates the dataPoints array by:
   *   - adding a new DataPoint for the current position of the MovingObject
   *   - removing any expired DataPoints that are past the CollisionLabConstants.MAX_DATA_POINT_LIFETIME
   *   - removing any DataPoints that are ahead of the total elapsed time of the simulation. This occurs when the
   *     step-backward button is pressed.
   * @public
   *
   * Generally called when the Ball's position is moved or when it changes direction and paths are visible.
   *
   * @param {number} time - the total elapsed time of the simulation, in seconds.
   */
  updateDataPoints( time ) {
    assert && assert( typeof time === 'number' && time > 0, `invalid time: ${time}` );

    // Add a new DataPoint for the current position of the MovingObject.
    this.dataPoints.push( new DataPoint( time, this.position ) );

    //----------------------------------------------------------------------------------------

    // Remove any expired DataPoints that are past the CollisionLabConstants.MAX_DATA_POINT_LIFETIME
    const expiredDataPoints = this.dataPoints.filter( dataPoint => {
      return dataPoint.time + PATH_DATA_POINT_LIFETIME <= time;
    } );

    expiredDataPoints.forEach( expiredDataPoint => { arrayRemove( this.dataPoints, expiredDataPoint ); } );

    //----------------------------------------------------------------------------------------

    // Remove any DataPoints that are ahead of the total elapsed time of the simulation. This occurs when the
    // step-backward button is pressed.
    const futureDataPoints = this.dataPoints.filter( dataPoint => {
      return dataPoint.time > time;
    } );

    futureDataPoints.forEach( futureDataPoint => { arrayRemove( this.dataPoints, futureDataPoint ); } );
  }

  /**
   * Clears the dataPoints array.
   * @public
   *
   * Generally called when the reset all button is pressed or when the restart button is pressed. Also called when
   * the 'Path' checkbox is un-checked.
   */
  clearDataPoints() {
    while ( this.dataPoints.length ) {
      this.dataPoints.pop();
    }
  }

  /**
   * Resets the MovingObject by resetting its dataPoints array. Called when the reset all method is pressed.
   * @public
   */
  reset() {
    this.clearDataPoints();
  }

  /**
   * Restarts the MovingObject by clearing its dataPoints array. Called when the restart method is pressed.
   * @public
   */
  restart() {
    this.clearDataPoints();
  }
}

collisionLab.register( 'MovingObject', MovingObject );
export default MovingObject;