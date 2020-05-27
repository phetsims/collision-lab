// Copyright 2020, University of Colorado Boulder

/**
 * Model for the trailing 'Path' behind a moving object, including Balls and the Center of Mass.
 *
 * Its main responsibility is to keep track of PathDataPoints that map out the trail of a Ball or a Center of Mass as
 * time progresses. This path is rendered if the 'Path' checkbox is checked, and only should be recorded in this case.
 * Path will also remove PathDataPoints that are past the set time period, which allows the trailing 'Path' to fade over
 * time. See https://github.com/phetsims/collision-lab/issues/61.
 *
 * Paths are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../CollisionLabQueryParameters.js';
import PathDataPoint from './PathDataPoint.js';

// constants
const PATH_DATA_POINT_LIFETIME = CollisionLabQueryParameters.pathPointLifetime;

class Path {

  /**
   * @param {Property.<Vector2>} positionProperty - the position moving object whose 'Path' is traced.
   * @param {Property.<boolean>} pathVisibleProperty - indicates if the 'Path' is currently visible. PathDataPoints are
   *                                                   only recorded if this is true and are cleared when set to false.
   */
  constructor( positionProperty, pathVisibleProperty ) {
    assert && assert( positionProperty instanceof Property && positionProperty.value instanceof Vector2, `invalid positionProperty: ${positionProperty}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid pathVisibleProperty: ${pathVisibleProperty}` );

    // @private {Property.<Vector2>} - reference to the positionProperty passed in.
    this.positionProperty = positionProperty;

    // @private {Property.<boolean>} - reference to the pathVisibleProperty passed in.
    this.pathVisibleProperty = pathVisibleProperty;

    // @public (read-only) {PathDataPoint[]} - the recorded points of the trailing points of the Path within a given
    //                                         time period, which is PATH_DATA_POINT_LIFETIME seconds.
    this.dataPoints = [];

    // @public (read-only) {Emitter} - Emits when the trailing path needs to be redrawn. Using an ObservableArray
    //                                 was considered for the dataPoints array instead of this, but ObservableArray's
    //                                 itemRemovedEmitter emits after each item removed, which would result in redrawing
    //                                 too many times when the dataPoints is cleared. Thus, this is used for a
    //                                 performance boost.
    this.redrawPathEmitter = new Emitter();

    //----------------------------------------------------------------------------------------

    // Observe when the pathVisibleProperty is manipulated to clear the Path when set to false.
    // Link lasts for the lifetime of the simulation and is never disposed.
    pathVisibleProperty.lazyLink( pathVisible => {
      if ( !pathVisible ) {
        this.clear();
      }
    } );
  }

  /**
   * Clears the Path's dataPoints.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - the reset all button is pressed.
   *   - the restart button is pressed.
   *   - when the 'Path' checkbox is un-checked.
   *   - when the Ball is dragged to a different position.
   *   - when the Ball's position changes from the Keypad.
   */
  clear() {
    while ( this.dataPoints.length ) {
      this.dataPoints.pop();
    }

    // Signal once that the trace 'Path' needs to be redrawn.
    this.redrawPathEmitter.emit();
  }

  /**
   * Updates the path by:
   *   - adding a new PathDataPoint for the current position of the moving object.
   *   - removing any expired PathDataPoints that are past the CollisionLabConstants.MAX_DATA_POINT_LIFETIME.
   *   - removing any PathDataPoints that are ahead of the total elapsed time of the simulation. This occurs when the
   *     step-backward button is pressed.
   *
   * If the path is not visible, nothing happens.
   *
   * @public
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // If the path is not visible, nothing happens.
    if ( !this.pathVisibleProperty.value ) { return; /* do nothing */ }

    // Add a new PathDataPoint for the current position of the moving object.
    this.dataPoints.push( new PathDataPoint( elapsedTime, this.positionProperty.value ) );

    //----------------------------------------------------------------------------------------

    // Remove any expired PathDataPoints that are not within the CollisionLabConstants.MAX_DATA_POINT_LIFETIME.
    const expiredPathDataPoints = this.dataPoints.filter( dataPoint => {
      return dataPoint.time + PATH_DATA_POINT_LIFETIME <= elapsedTime;
    } );

    expiredPathDataPoints.forEach( expiredPathDataPoint => { arrayRemove( this.dataPoints, expiredPathDataPoint ); } );

    //----------------------------------------------------------------------------------------

    // Remove any PathDataPoints that are ahead of the total elapsedTime of the simulation. This occurs when the
    // step-backward button is pressed.
    const futurePathDataPoints = this.dataPoints.filter( dataPoint => {
      return dataPoint.time > elapsedTime;
    } );

    futurePathDataPoints.forEach( futurePathDataPoint => { arrayRemove( this.dataPoints, futurePathDataPoint ); } );

    // Signal that the trace 'Path' needs to be redrawn.
    this.redrawPathEmitter.emit();
  }
}

collisionLab.register( 'Path', Path );
export default Path;