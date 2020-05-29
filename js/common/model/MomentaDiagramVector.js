// Copyright 2020, University of Colorado Boulder

/**
 * A model for a single Vector that appears in the 'Momenta Diagram' accordion box. A single MomentaDiagramVector
 * correlates to a single prepopulatedBalls Ball, which may or may not be in the PlayArea system.
 *
 * Responsibilities are:
 *  - tracking the tail of the Vector in a Property.
 *  - deriving the tip of the Vector in a Property from a Ball's momentumProperty.
 *  - keeping track of a whether or not its correlated Ball is currently in the PlayArea system.
 *
 * MomentaDiagramVector's tails are positioned in MomentaDiagram.js. Since MomentaDiagramVectors correlate to a
 * prepopulatedBalls, which are never disposed, MomentaDiagramVectors are also never disposed.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';

class MomentaDiagramVector {

  /**
   * @param {Ball} ball - the Ball whose momentum is modeled. May or may not be in the PlayArea system.
   * @param {Vector2} initialTailPosition - the initial tail position of the Vector.
   * @param {ObservableArray.<Ball>} balls - the Balls that are in the PlayArea system.
   */
  constructor( ball, initialTailPosition, balls ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( initialTailPosition instanceof Vector2, `invalid initialTailPosition: ${initialTailPosition}` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Vector2Property} - the tail position of the Vector, in meter coordinates.
    this.tailPositionProperty = new Vector2Property( initialTailPosition );

    // @public (read-only) {DerivedProperty.<Vector2>} - the tip position of the Vector (m). Dispose is unnecessary
    //                                                   since MomentaDiagramVectors are never disposed.
    this.tipPositionProperty = new DerivedProperty( [ ball.momentumProperty ], momentum => this.tail.plus( momentum ), {
      valueType: Vector2
    } );

    // @public (read-only) {DerivedProperty.<boolean>} - indicates if the correlated Ball (and thus, the Vector itself)
    //                                                   is in the PlayArea system. Never disposed since
    //                                                   MomentaDiagramVectors are never disposed.
    this.isInPlayAreaProperty = new DerivedProperty( [ balls.lengthProperty ], () => balls.contains( ball ), {
      valueType: 'boolean'
    } );
  }

  /**
   * Resets the Vector. Called when the reset-all button is pressed.
   * @public
   *
   * Technically, since the tail and tip is set externally, which depends on Balls, this isn't needed. However,
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

collisionLab.register( 'MomentaDiagramVector', MomentaDiagramVector );
export default MomentaDiagramVector;