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
 * MomentaDiagramVectors are also never disposed, even when they are removed from the system. See MomentaDiagram.js.
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

    // @public {Property.<Vector2>} - the tail position of the Vector, in kg*(m/s). Initialized at the origin and to be
    //                                updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<Vector2>} - the Momentum Vector's components, which are its x and y scalar values. Initialized
    //                                at zero and to be updated later in MomentaDiagram.js
    this.componentsProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<Vector2>} - the tip position of the Vector. Never disposed since MomentaDiagramVectors
    //                                are never disposed.
    this.tipPositionProperty = new DerivedProperty( [ this.tailPositionProperty, this.componentsProperty ],
      ( tailPosition, components ) => tailPosition.plus( components ), {
        valueType: Vector2
      } );
  }

  /**
   * Resets the Vector. Called when the reset-all button is pressed.
   * @public
   *
   * Technically, since the tail and tip are set externally, which depends on the Ball's momentums, this method isn't
   * needed. However, the PhET convention is to completely reset when the reset all button is pressed, so we follow that
   * here.
   */
  reset() {
    this.tailPositionProperty.reset();
    this.componentsProperty.reset();
  }

  /*----------------------------------------------------------------------------*
   * Convenience setters/getters.
   *----------------------------------------------------------------------------*/

  /**
   * Gets the center position of the Vector.
   * @public
   *
   * @returns {Vector2} - in kg*(m/s).
   */
  get center() { return this.componentsProperty.value.times( 0.5 ).add( this.tailPositionProperty.value ); }

  /**
   * Gets the magnitude of the MomentaDiagramVector, which is always positive.
   * @public
   *
   * @returns {number} - in kg*(m/s).
   */
  get magnitude() { return this.componentsProperty.value.magnitude; }

  /**
   * Gets the angle of the MomentaDiagramVector in radians, measured clockwise from the horizontal. Null when the
   * vector has 0 magnitude.
   * @public
   *
   * @returns {number|null} - in radians.
   */
  get angle() {
    return this.magnitude <= CollisionLabConstants.ZERO_THRESHOLD ? null : this.componentsProperty.value.angle;
  }
}

collisionLab.register( 'MomentaDiagramVector', MomentaDiagramVector );
export default MomentaDiagramVector;