// Copyright 2020, University of Colorado Boulder

/**
 * Base class for a generic Vector that appears in the 'Momenta Diagram' accordion box. Intended to be subtyped as the
 * Ball momentum Vectors and the sum Vector behave differently.
 *
 * Responsibilities are:
 *  - tracking the tail of the Vector in a Property.
 *  - deriving the tip of the Vector in a Property from a componentProperty.
 *  - convenience methods.
 *
 * MomentaDiagramVectors, like Balls, are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';

class MomentaDiagramBaseVector {

  /**
   * @param {Property.<Vector2>} componentProperty - the Property of the components of the Vector.
   */
  constructor( componentProperty ) {
    assert && assert( componentProperty instanceof Property && componentProperty.value instanceof Vector2, `invalid componentProperty: ${componentProperty}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Vector2Property} - the tail position of the Vector, in meter coordinates. Initialized at the
    //                                         origin and to be updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property( Vector2.ZERO );

    // @public (read-only) {DerivedProperty.<Vector2>} - the tip position of the Vector (m). Dispose is unnecessary
    //                                                   since MomentaDiagramBaseVectors are never disposed.
    this.tipPositionProperty = new DerivedProperty( [ componentProperty ], component => this.tail.plus( component ), {
      valueType: Vector2
    } );
  }

  /**
   * Resets the Vector. Called when the reset-all button is pressed.
   * @public
   *
   * Technically, since the tail is set externally, which depends on Balls momentums, this method isn't needed. However,
   * the PhET convention is to completely reset when the reset all button is pressed, so we follow that here.
   */
  reset() {
    this.tailPositionProperty.reset();
  }

  /**
   * Gets the tail position of the Vector, in meter coordinates.
   * @public
   *
   * @returns {Vector2}
   */
  get tail() { return this.tailPositionProperty.value; }

  /**
   * Gets the tip position of the Vector, in meter coordinates.
   * @public
   *
   * @returns {Vector2}
   */
  get tip() { return this.tipPositionProperty.value; }

  /**
   * Sets the tail position, in meter coordinates.
   * @public
   *
   * @param {Vector2} tail - in meter coordinates.
   */
  set tail( tail ) { this.tailPositionProperty.value = tail; }
}

collisionLab.register( 'MomentaDiagramBaseVector', MomentaDiagramBaseVector );
export default MomentaDiagramBaseVector;