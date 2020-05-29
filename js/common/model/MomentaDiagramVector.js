// Copyright 2020, University of Colorado Boulder

/**
 * A model for a single Vector that appears in the 'Momenta Diagram' accordion box. A single MomentaDiagramVector
 * correlates to a single prepopulatedBalls Ball, which may or may not be in the PlayArea system.
 *
 * Extends MomentaDiagramBaseVector but it also keeps track of a whether or not its correlated Ball is currently in the
 * PlayArea system.
 *
 * MomentaDiagramVector's tails are positioned in MomentaDiagram.js. Since MomentaDiagramVectors correlate to a
 * prepopulatedBalls, which are never disposed, MomentaDiagramVectors are also never disposed.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';

class MomentaDiagramVector {

  constructor() {


    // @public (read-only) {Vector2Property} - the tail position of the Vector, in meter coordinates. Initialized at the
    //                                         origin and to be updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property( Vector2.ZERO );


    // @public (read-only) {Vector2Property} - the tip position of the Vector, in meter coordinates. Initialized at the
    //                                         origin and to be updated later in MomentaDiagram.js
    this.tipPositionProperty = new Vector2Property( Vector2.ZERO );
  }


  /**
   * Gets the tail position of the Vector, in meter coordinates.
   * @public
   *
   * @returns {Vector2}
   */
  get tail() { return this.tailPositionProperty.value; }

  /**
   * Sets the tail position, in meter coordinates.
   * @public
   *
   * @param {Vector2} tail - in meter coordinates.
   */
  set tail( tail ) { this.tailPositionProperty.value = tail; }

  /**
   * Gets the tip position of the Vector, in meter coordinates.
   * @public
   *
   * @returns {Vector2}
   */
  get tip() { return this.tipPositionProperty.value; }

  /**
   * Sets the tip position, in meter coordinates.
   * @public
   *
   * @param {Vector2} tip - in meter coordinates.
   */
  set tip( tip ) { this.tipPositionProperty.value = tip; }

  /**
   * Sets the components of the Vector.
   * @public
   *
   * @param {Vector2} components - in meters.
   */
  set components( components ) { this.tip = this.tail.plus( components ); }
}

collisionLab.register( 'MomentaDiagramVector', MomentaDiagramVector );
export default MomentaDiagramVector;