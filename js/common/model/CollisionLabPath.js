// Copyright 2020, University of Colorado Boulder

/**
 * Model for the trailing 'Path' behind a moving object, including Balls and the Center of Mass. Originally called
 * 'Path' but changed to 'CollisionLabPath'. See https://github.com/phetsims/collision-lab/issues/79.
 *
 * Its main responsibility is to keep track of PathDataPoints that map out the trail of a Ball or the Center of Mass as
 * time progresses. In the design, the trailing 'Paths' only shows the recent path of the moving object AFTER the
 * visibility checkbox is checked, meaning the Path is always empty if the checkbox isn't checked and PathDataPoints
 * are only recorded if the checkbox is checked.
 *
 * CollisionLabPath will also remove PathDataPoints that are past the set time period, which allows the trailing 'Path'
 * to fade over time. See https://github.com/phetsims/collision-lab/issues/61.
 *
 * CollisionLabPaths are created for each Ball, which are never disposed, meaning CollisionLabPaths are also never
 * disposed and internal links are left as-is. This doesn't negatively impact performance since Balls that aren't in the
 * system aren't stepped and their positions don't change.
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
   * @param {Property.<boolean>} pathsVisibleProperty - indicates if the 'Path' is visible. PathDataPoints are
   *                                                    only recorded if this is true and are cleared when set to false.
   * @param {Property.<number>} elapsedTimeProperty - total elapsed time of the simulation, in seconds.
   * @param {Bounds2} playAreaBounds - the bounds of the PlayArea.
   */
  constructor( positionProperty, pathsVisibleProperty, elapsedTimeProperty, playAreaBounds ) {
    assert && AssertUtils.assertPropertyOf( positionProperty, Vector2 );
    assert && AssertUtils.assertPropertyOf( pathsVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PathDataPoint[]} - the recorded points of the trailing points of the 'Path' within a given
    //                                         time period, which is PATH_DATA_POINT_LIFETIME seconds.
    this.dataPoints = [];

    // @public (read-only) {Emitter} - Emits when the trailing 'path' has changed in any form. Using an ObservableArray
    //                                 was considered for the dataPoints array instead of this, but ObservableArray's
    //                                 itemRemovedEmitter emits after each item removed, which would result in redrawing
    //                                 too many times when multiple dataPoints are cleared. Thus, this is used for a
    //                                 slight performance boost.
    this.pathChangedEmitter = new Emitter();

    //----------------------------------------------------------------------------------------

    // Observe when the elapsed time of the simulation changes and record a new PathDataPoint at the current elapsedTime
    // and position, if paths are visible. This link persists for the lifetime of the simulation since CollisionLabPaths
    // are never disposed.
    elapsedTimeProperty.link( elapsedTime => {
      pathsVisibleProperty.value && this.updatePath( positionProperty.value, elapsedTime );
    } );

    // Observe when the pathsVisibleProperty is manipulated and clear the 'Path' when set to false. Link lasts for the
    // lifetime of the simulation and is never disposed.
    pathsVisibleProperty.lazyLink( pathVisible => {
      !pathVisible && this.clear();
    } );

    // @public (read-only) {Bounds2} - reference to the playAreaBounds. PathDataPoints are only recorded if the
    //                                 position is inside this bounds. It is also used for the view's canvas bounds.
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
   *   - when the Ball (if the moving object is a ball) is user-manipulated, either by dragging or from the Keypad.
   *   - when the Ball (if the moving object is a ball) is removed from the system.
   */
  clear() {
    while ( this.dataPoints.length ) {
      this.dataPoints.pop();
    }

    // Signal once that the trailing 'Path' has changed.
    this.pathChangedEmitter.emit();
  }

  /**
   * Updates the path by:
   *   - adding a new PathDataPoint for the current position of the moving object.
   *   - removing any expired PathDataPoints that are past the MAX_DATA_POINT_LIFETIME.
   *   - removing any PathDataPoints that are ahead of the total elapsed time of the simulation. This occurs when the
   *     step-backward button is pressed.
   * @public
   *
   * NOTE: if this is invoked, the path must be visible.
   *
   * @param {Vector2} position - the position of the moving object, in meter coordinates.
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath( position, elapsedTime ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

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
    if ( this.playAreaBounds.containsPoint( position ) ) {
      this.dataPoints.push( new PathDataPoint( elapsedTime, position ) );
    }

    // Ensure that the dataPoints are strictly sorted by time.
    assert && assert( CollisionLabUtils.isSortedBy( this.dataPoints, _.property( 'time' ) ) );

    // Signal that the trailing 'Path' has changed.
    this.pathChangedEmitter.emit();
  }
}

collisionLab.register( 'CollisionLabPath', CollisionLabPath );
export default CollisionLabPath;