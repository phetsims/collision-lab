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

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';

class MomentaDiagramVector {

  constructor() {

    // @public {Vector2Property} - the tail position of the Vector, in kg*(m/s). Initialized at the origin and to be
    //                             updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Vector2Property} - the Momentum Vector's components, its x and y scalar values. Initialized at the
    //                             origin and to be updated later in MomentaDiagram.js
    this.componentsProperty = new Vector2Property( Vector2.ZERO );

    // @public {DerivedProperty.<Vector2>} - the tip position of the Vector. Never disposed since MomentaDiagramVectors
    //                                       are never disposed.
    this.tipPositionProperty = new DerivedProperty( [ this.tailPositionProperty, this.componentsProperty ],
      ( tailPosition, components ) => tailPosition.plus( components ), {
        valueType: Vector2
      } );
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
    this.componentsProperty.reset();
  }

  /*----------------------------------------------------------------------------*
   * Convenience setters/getters.
   *----------------------------------------------------------------------------*/

  /**
   * Gets the tail position of the Vector, in kg*(m/s) coordinates.
   * @public
   *
   * @returns {Vector2}
   */
  get tail() { return this.tailPositionProperty.value; }

  /**
   * Sets the tail position, in kg*(m/s) coordinates.
   * @public
   *
   * @param {Vector2} tail - in kg*(m/s) coordinates.
   */
  set tail( tail ) { this.tailPositionProperty.value = tail; }

  /**
   * Gets the tip position of the Vector, in kg*(m/s) coordinates.
   * @public
   *
   * @returns {Vector2}
   */
  get tip() { return this.tipPositionProperty.value; }

  /**
   * Gets the tip's x coordinate.
   * @public
   * @returns {number}
   */
  get tipX() { return this.tipPositionProperty.value.x; }

  /**
   * Gets the tip's y coordinate.
   * @public
   * @returns {number}
   */
  get tipY() { return this.tipPositionProperty.value.y; }

  /**
   * Sets the tail's x coordinate. Keeps the components constant.
   * @public
   * @param {number} tailX
   */
  set tailX( tailX ) {
    this.tail = new Vector2( tailX, this.tail.y );
  }

  /**
   * Sets the tail's y coordinate. Keeps the components constant.
   * @public
   * @param {number} tailY
   */
  set tailY( tailY ) {
    this.tail = new Vector2( this.tail.x, tailY );
  }

  /**
   * Gets the tail's y coordinate.
   * @public
   * @returns {number}
   */
  get tailY() { return this.tailPositionProperty.value.y; }

  /**
   * Sets the components of the Vector.
   * @public
   *
   * @param {Vector2} components - in kg*(m/s).
   */
  set components( components ) { this.componentsProperty.value = components; }
}

collisionLab.register( 'MomentaDiagramVector', MomentaDiagramVector );
export default MomentaDiagramVector;