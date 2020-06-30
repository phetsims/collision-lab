// Copyright 2020, University of Colorado Boulder

/**
 * The Model representation for the 'Momenta Diagram', which appears at the bottom right of each screen. Features the
 * momentum Vectors of each Ball in the BallSystem, along with a 'total' momentum vector, in a completely separate
 * coordinate frame from the PlayArea.
 *
 * Responsibilities are:
 *   - Create a MomentaDiagramVector for all possible Balls and one for the total Momentum Vector. Momenta Diagram takes
 *     advantage of the prepopulatedBalls, which all Balls in the system must be apart of. Instead of creating a
 *     MomentaDiagramVector each time a Ball is added to the system, it creates one for each prepopulatedBall and
 *     only updates it if the associated Ball is in the system, which eliminates the necessity to dispose
 *     MomentaDiagramVectors.
 *
 *   - Update the tail positions and components of the MomentaDiagramVectors when necessary. MomentaDiagrams are
 *     designed and implemented to be minimally invasive to optimize the performance of the simulation. The position
 *     and components of the MomentaDiagramVectors are only updated if the Momenta Diagram accordion box is expanded.
 *     The positioning also differs depending on the dimensions of the PlayArea.
 *
 * MomentaDiagrams are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import MomentaDiagramVector from './MomentaDiagramVector.js';

class MomentaDiagram {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArray.<Ball>} balls - the balls in the system. Must belong in prepopulatedBalls.
   * @param {number} dimensions - the dimensions of the PlayArea, used for positioning differences. Either 1 or 2.
   */
  constructor( prepopulatedBalls, balls, dimensions ) {
    assert && AssertUtils.assertArrayOf( prepopulatedBalls, Ball );
    assert && AssertUtils.assertObservableArrayOf( balls, Ball );
    assert && assert( dimensions === 1 || dimensions === 2, `invalid dimensions: ${dimensions}` );

    // @public {BooleanProperty} - indicates if the MomentaDiagram is expanded. This is in the model since the positions
    //                             and components of the Momenta Vectors are only updated if this is true.
    this.expandedProperty = new BooleanProperty( false );

    // @public (read-only) {Map.<Ball, MomentaDiagramVector>} - Map prepopulatedBalls to an associated Momenta Vector.
    this.ballToMomentaVectorMap = new Map();

    // Populate the Map with MomentaDiagramVectors.
    prepopulatedBalls.forEach( ball => {
      this.ballToMomentaVectorMap.set( ball, new MomentaDiagramVector() );
    } );

    // @public (read-only) {MomentaDiagramVector} - the total sum of the Momenta Vectors of the system.
    this.totalMomentumVector = new MomentaDiagramVector();

    // @private {ObservableArray.<Balls>} - reference to the Balls in the BallSystem.
    this.balls = balls;

    // @private {number} - reference to the passed-in dimensions of the PlayArea.
    this.dimensions = dimensions;

    //----------------------------------------------------------------------------------------

    // Create a Multilink to update the positioning and components of the Momenta Vectors.
    //
    // For the dependencies, we use:
    //  - expandedProperty; for performance reasons, the MomentaDiagram isn't updated it isn't visible.
    //  - The momentum Properties of the prepopulatedBalls. Only the balls in the BallSystem are positioned and used in
    //    the total momentum calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total momentum.
    //
    // This Multilink is never disposed and lasts for the lifetime of the sim.
    Property.multilink(
      [ this.expandedProperty, ...prepopulatedBalls.map( ball => ball.momentumProperty ), balls.lengthProperty ],
      expanded => {
        expanded && this.updateVectors(); // Only update if the MomentaDiagram is visible (expanded).
      }
    );
  }

  /**
   * Resets the MomentaDiagram.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.expandedProperty.reset();
    this.ballToMomentaVectorMap.forEach( momentaVector => { momentaVector.reset(); } );
    this.totalMomentumVector.reset();
  }

  /**
   * Updates the components and positions of the momentum Vectors to match the Balls in the BallSystem. Only the Balls
   * in the BallSystem are updated and used to calculate the total momentum.
   * @private
   *
   * The positioning of the momentum Vectors are different for each dimension:
   *
   *   For 2D Screens:
   *     - The first momentum and the total momentum Vectors are placed at the origin.
   *     - Momentum vectors are placed tip-to-tail
   *
   *   For 1D screens:
   *     - The momentum vectors are stacked vertically on top of each other, with the first vector on top and
   *       the tailY coordinates of the other vectors are one-off of each other.
   *     - The first momentum Vector and the total momentum Vector's tailX are placed at x = 0. The vectors are then
   *       placed tipX-to-tailX.
   */
  updateVectors() {

    // First update the components of the Vectors.
    this.balls.forEach( ball => {
      this.ballToMomentaVectorMap.get( ball ).components = ball.momentum;
    } );

    // Compute the components of the total Momenta Vector.
    const totalMomentum = Vector2.ZERO.copy();

    // Loop through and calculate the total momentum of the Balls in the BallSystem.
    this.balls.forEach( ball => { totalMomentum.add( ball.momentum ); } );
    this.totalMomentumVector.components = totalMomentum;

    //----------------------------------------------------------------------------------------

    // Reference the Momenta Vector associated with the first Ball in the system.
    const firstMomentaVector = this.ballToMomentaVectorMap.get( this.balls.get( 0 ) );

    // Position the first Momenta Vector and the total Momenta Vector in the correct position.
    if ( this.dimensions === 2 ) {

      // Set the first Momenta Vector's tail and the total Momenta Vector's tail at the origin.
      firstMomentaVector.tail = Vector2.ZERO;
      this.totalMomentumVector.tail = Vector2.ZERO;
    }
    else {

      // Set the first Momenta Vector's tail and the total Momenta Vector's tail at x = 0.
      firstMomentaVector.tailX = 0;
      this.totalMomentumVector.tailX = 0;

      // Set the y-value of the first Momenta Vector's tail and the total Momenta Vector's tail which depends on the
      // number of balls in the system.
      firstMomentaVector.tailY = 1 + Math.floor( ( this.balls.length - 1 ) / 2 );
      this.totalMomentumVector.tailY = firstMomentaVector.tailY - this.balls.length;
    }

    // Position the rest of the Momentum vectors. Loop in pairs.
    CollisionLabUtils.forEachAdjacentPair( this.balls, ( ball, previousBall ) => {
      const momentaVector = this.ballToMomentaVectorMap.get( ball );
      const previousMomentaVector = this.ballToMomentaVectorMap.get( previousBall );

      if ( this.dimensions === 2 ) {

        // tip-to-tail
        momentaVector.tail = previousMomentaVector.tip;
      }
      else {

        // tipX-to-tailX
        momentaVector.tailX = previousMomentaVector.tipX;

        // Stack vertically on top of each other by progressively decrementing the tipY by 1.
        momentaVector.tailY = previousMomentaVector.tailY - 1;
      }
    } );
  }
}

collisionLab.register( 'MomentaDiagram', MomentaDiagram );
export default MomentaDiagram;