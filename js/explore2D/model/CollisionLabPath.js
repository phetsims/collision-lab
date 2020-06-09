// Copyright 2020, University of Colorado Boulder

/**
 * Model for the trailing 'Path' behind a moving object, including Balls and the Center of Mass. Originally called
 * 'Path' but changed to 'CollisionLabPath'. See https://github.com/phetsims/collision-lab/issues/79.
 *
 * Its main responsibility is to keep track of PathDataPoints that map out the trail of a Ball or a Center of Mass as
 * time progresses. PathDataPoints are only recorded if the 'Path' checkbox is checked and are empty otherwise.
 * CollisionLabPath will also remove PathDataPoints that are past the set time period, which allows the trailing 'Path'
 * to fade over time. See https://github.com/phetsims/collision-lab/issues/61.
 *
 * CollisionLabPaths are created for each Ball, which are never disposed, meaning CollisionLabPaths are
 * also never disposed and internal links are left as-is. This doesn't negatively impact performance since
 * Balls that aren't in the system aren't stepped and their positions don't change.
 *
 * @author Brandon Li
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../../common/CollisionLabQueryParameters.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import PathDataPoint from './PathDataPoint.js';

// constants
const PATH_DATA_POINT_LIFETIME = CollisionLabQueryParameters.pathPointLifetime;

class CollisionLabPath {

  /**
   * @param {Property.<Vector2>} positionProperty - the position of the moving object, in meters.
   * @param {Property.<boolean>} pathVisibleProperty - indicates if the 'Path' is visible. PathDataPoints are
   *                                                   only recorded if this is true and are cleared when set to false.
   * @param {Property.<number>} elapsedTimeProperty - total elapsed time of the simulation, in seconds.
   * @param {Bounds2} playAreaBounds - the bounds of the PlayArea.
   */
  constructor( positionProperty, pathVisibleProperty, elapsedTimeProperty, playAreaBounds ) {
    assert && AssertUtils.assertPropertyOf( positionProperty, Vector2 );
    assert && AssertUtils.assertPropertyOf( pathVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PathDataPoint[]} - the recorded points of the trailing points of the 'Path' within a given
    //                                         time period, which is PATH_DATA_POINT_LIFETIME seconds.
    this.dataPoints = [];

    // @public (read-only) {Emitter} - Emits when the trailing path needs to be redrawn. Using an ObservableArray
    //                                 was considered for the dataPoints array instead of this, but ObservableArray's
    //                                 itemRemovedEmitter emits after each item removed, which would result in redrawing
    //                                 too many times when the multiple dataPoints are cleared. Thus, this is used for a
    //                                 performance boost.
    this.redrawPathEmitter = new Emitter();

    //----------------------------------------------------------------------------------------

    // Observe when the position of the moving object changes and record a new PathDataPoint at the current elapsedTime
    // if paths are visible and the position is inside of the PlayArea's bounds. This link persists for the lifetime of
    // the simulation since CollisionLabPaths are never disposed.
    positionProperty.link( position => {

      // Update this 'Path' if it's visible and inside of the PlayArea's bounds.
      if ( pathVisibleProperty.value && playAreaBounds.containsPoint( position ) ) {
        this.updatePath( position, elapsedTimeProperty.value );
      }
    } );

    // Observe when the pathVisibleProperty is manipulated to clear the 'Path' when set to false.
    // Link lasts for the lifetime of the simulation and is never disposed.
    pathVisibleProperty.lazyLink( pathVisible => {
      !pathVisible && this.clear();
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Bounds2} - reference to the playAreaBounds. PathDataPoints are only recorded if the
    //                                 position is inside this bounds. It is also used for the view canvas bounds.
    this.playAreaBounds = playAreaBounds;
  }

  /**
   * Clears the Path's DataPoints.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - the reset all button is pressed.
   *   - the restart button is pressed.
   *   - when the 'Path' checkbox is un-checked.
   *   - when the Ball is user-manipulated, either by dragging or from the Keypad.
   */
  clear() {
    while ( this.dataPoints.length ) {
      this.dataPoints.pop();
    }

    // Signal once that the trailing 'Path' needs to be redrawn.
    this.redrawPathEmitter.emit();
  }

  /**
   * Updates the path by:
   *   - adding a new PathDataPoint for the current position of the moving object.
   *   - removing any expired PathDataPoints that are past the MAX_DATA_POINT_LIFETIME.
   *   - removing any PathDataPoints that are ahead of the total elapsed time of the simulation. This occurs when the
   *     step-backward button is pressed.
   * @public
   *
   * NOTE: if this is invoked, the path must be visible and the position must be inside the PlayArea.
   *
   * @param {Vector2} position - the position of the moving object, in meter coordinates.
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath( position, elapsedTime ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );
    assert && assert( this.playAreaBounds.containsPoint( position ) );

    // Remove any expired PathDataPoints that are not within the MAX_DATA_POINT_LIFETIME.
    const expiredPathDataPoints = this.dataPoints.filter( dataPoint => {
      return dataPoint.time + PATH_DATA_POINT_LIFETIME <= elapsedTime;
    } );

    expiredPathDataPoints.forEach( expiredPathDataPoint => { arrayRemove( this.dataPoints, expiredPathDataPoint ); } );

    //----------------------------------------------------------------------------------------

    // Remove any PathDataPoints that are ahead of the total elapsedTime of the simulation. This occurs when the
    // step-backward button is pressed.
    const futurePathDataPoints = this.dataPoints.filter( dataPoint => {
      return dataPoint.time >= elapsedTime;
    } );

    futurePathDataPoints.forEach( futurePathDataPoint => { arrayRemove( this.dataPoints, futurePathDataPoint ); } );

    //----------------------------------------------------------------------------------------

    // Add a new PathDataPoint for the current position of the moving object.
    this.dataPoints.push( new PathDataPoint( elapsedTime, position ) );

    // Ensure that the dataPoints are strictly sorted by time.
    assert && assert( CollisionLabUtils.isSorted( this.dataPoints.map( _.property( 'time' ) ) ) );

    // Signal that the trailing 'Path' needs to be redrawn.
    this.redrawPathEmitter.emit();
  }
}

collisionLab.register( 'CollisionLabPath', CollisionLabPath );
export default CollisionLabPath;