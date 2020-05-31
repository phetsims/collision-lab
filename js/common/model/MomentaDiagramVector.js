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
import CollisionLabConstants from '../CollisionLabConstants.js';

class MomentaDiagramVector {

  constructor() {

    // @public {Vector2Property} - the tail position of the Vector, in kg*(m/s). Initialized at the origin and to be
    //                             updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Vector2Property} - the Momentum Vector's components, which are its x and y scalar values. Initialized
    //                              at the origin and to be updated later in MomentaDiagram.js
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
   * However, the PhET convention is to completely reset when the reset all button is pressed, so we follow that here.
   */
  reset() {
    this.tailPositionProperty.reset();
    this.componentsProperty.reset();
  }

  /*----------------------------------------------------------------------------*
   * Convenience setters/getters.
   *----------------------------------------------------------------------------*/

  /**
   * Gets the tail position of the Vector, in kg*(m/s).
   * @public
   *
   * @returns {Vector2}
   */
  get tail() { return this.tailPositionProperty.value; }

  /**
   * Gets the tail's y coordinate, in kg*(m/s).
   * @public
   *
   * @returns {number}
   */
  get tailY() { return this.tail.y; }

  /**
   * Gets the tail's x coordinate, in kg*(m/s).
   * @public
   *
   * @returns {number}
   */
  get tailX() { return this.tail.x; }

  /**
   * Sets the tail position, in kg*(m/s).
   * @public
   *
   * @param {Vector2} tail - in kg*(m/s).
   */
  set tail( tail ) { this.tailPositionProperty.value = tail; }

  /**
   * Sets the tail's x coordinate, keeping the components constant.
   * @public
   *
   * @param {number} tailX - in kg*(m/s).
   */
  set tailX( tailX ) { this.tail = new Vector2( tailX, this.tailY ); }

  /**
   * Sets the tail's y coordinate, keeping the components constant.
   * @public
   *
   * @param {number} tailY - in kg*(m/s).
   */
  set tailY( tailY ) { this.tail = new Vector2( this.tailX, tailY ); }

  //----------------------------------------------------------------------------------------

  /**
   * Gets the tip position of the Vector, in kg*(m/s).
   * @public
   *
   * @returns {Vector2}
   */
  get tip() { return this.tipPositionProperty.value; }

  /**
   * Gets the tip's x coordinate.
   * @public
   *
   * @returns {number} - in kg*(m/s)
   */
  get tipX() { return this.tip.x; }

  /**
   * Gets the tip's y coordinate.
   * @public
   *
   * @returns {number} - in kg*(m/s)
   */
  get tipY() { return this.tip.y; }

  //----------------------------------------------------------------------------------------

  /**
   * Gets the components of the Vector.
   * @public
   *
   * @returns {Vector2} - in kg*(m/s).
   */
  get components() { return this.componentsProperty.value; }

  /**
   * Sets the components of the Vector.
   * @public
   *
   * @param {Vector2} components - in kg*(m/s).
   */
  set components( components ) { this.componentsProperty.value = components; }

  /**
   * Gets the center position of the Vector.
   * @public
   *
   * @returns {Vector2} - in kg*(m/s).
   */
  get center() { return this.components.times( 0.5 ).add( this.tail ); }

  /**
   * Gets the magnitude of the MomentaDiagramVector, which is always positive.
   * @public
   *
   * @returns {number} - in kg*(m/s).
   */
  get magnitude() { return this.components.magnitude; }

  /**
   * Gets the angle of the MomentaDiagramVector in radians, measured clockwise from the horizontal. Null when the
   * vector has 0 magnitude.
   * @public
   *
   * @returns {number|null}
   */
  get angle() {
    return this.magnitude <= CollisionLabConstants.ZERO_THRESHOLD ? null : this.components.angle;
  }
}

collisionLab.register( 'MomentaDiagramVector', MomentaDiagramVector );
export default MomentaDiagramVector;