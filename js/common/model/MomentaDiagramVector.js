// Copyright 2020, University of Colorado Boulder

/**
 * A model for a single Vector that appears in the 'Momenta Diagram' accordion box. This model is intended to be used by
 * both the Momenta Vectors of the Balls and the total Momenta Vector.
 *
 * Responsible for:
 *   - Keeping track of the tail position of the Vector
 *   - Keeping track of the tip position of the Vector
 *   - Convenience methods for setting the tail, tip, components.
 *
 * MomentaDiagramVectors should only be positioned in MomentaDiagram.js. Since Balls are never disposed,
 * MomentaDiagramVectors are also never disposed, even when they are removed from the PlayArea. See MomentaDiagram.js.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';

class MomentaDiagramVector {

  constructor() {

    // @public {Vector2Property} - the tail position of the Vector, in meter coordinates. Initialized at the
    //                             origin and to be updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property( Vector2.ZERO );


    // @public {Vector2Property} - the tip position of the Vector, in meter coordinates. Initialized at the
    //                             origin and to be updated later in MomentaDiagram.js
    this.tipPositionProperty = new Vector2Property( Vector2.ZERO );
  }

  /**
   * Resets the Vector. Called when the reset-all button is pressed.
   * @public
   *
   * Technically, since the tail and tip are set externally, which depends on Balls momentums, this method isn't needed.
   * However, he PhET convention is to completely reset when the reset all button is pressed, so we follow that here.
   */
  reset() {
    this.tailPositionProperty.reset();
    this.tipPositionProperty.reset();
  }

  /*----------------------------------------------------------------------------*
   * Convenience setters/getters.
   *----------------------------------------------------------------------------*/

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