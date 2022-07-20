// Copyright 2020-2022, University of Colorado Boulder

/**
 * The Model representation for the 'Momenta Diagram', which appears at the bottom right of each screen. Features the
 * momentum Vectors of each Ball in the BallSystem, along with a 'total' momentum vector, in a completely separate
 * coordinate frame from the PlayArea.
 *
 * Responsibilities are:
 *   - Keeping track of the zoom and Bounds of the MomentaDiagram.
 *   - Create a MomentaDiagramVector for all possible Balls and one for the total Momentum Vector. Momenta Diagram takes
 *     advantage of the prepopulatedBalls, which all Balls in the system must be apart of. Instead of creating a
 *     MomentaDiagramVector each time a Ball is added to the system, it creates one for each prepopulatedBall and
 *     only updates it if the associated Ball is in the system, which eliminates the necessity to dispose
 *     MomentaDiagramVectors.
 *
 *   - Update the tail positions and components of the MomentaDiagramVectors when necessary. MomentaDiagrams are
 *     designed and implemented to be minimally invasive to optimize the performance of the simulation. The position
 *     and components of the MomentaDiagramVectors are only updated if the Momenta Diagram accordion box is expanded.
 *     The positioning also differs depending on the dimension of the PlayArea.
 *
 * MomentaDiagrams are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import MomentaDiagramVector from './MomentaDiagramVector.js';
import PlayArea from './PlayArea.js';

// constants
const MOMENTA_DIAGRAM_ZOOM_RANGE = CollisionLabConstants.MOMENTA_DIAGRAM_ZOOM_RANGE;
const MOMENTA_DIAGRAM_ASPECT_RATIO = CollisionLabConstants.MOMENTA_DIAGRAM_ASPECT_RATIO;
const ZOOM_MULTIPLIER = 2;
const DEFAULT_1D_VERTICAL_SPACING = 0.3;

class MomentaDiagram {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArrayDef.<Ball>} balls - the balls in the system. Must belong in prepopulatedBalls.
   * @param {number} dimension - the dimension of the PlayArea, used for positioning differences. Either 1 or 2.
   */
  constructor( prepopulatedBalls, balls, dimension ) {
    assert && AssertUtils.assertArrayOf( prepopulatedBalls, Ball );
    assert && assert( Array.isArray( balls ) ) && AssertUtils.assertArrayOf( balls, Ball );
    assert && assert( PlayArea.Dimension.includes( dimension ), `invalid dimension: ${dimension}` );

    // @public {Property.<number>} - the zoom factor of the MomentaDiagram. This is set externally in the view.
    this.zoomProperty = new NumberProperty( MOMENTA_DIAGRAM_ZOOM_RANGE.defaultValue, {
      range: MOMENTA_DIAGRAM_ZOOM_RANGE
    } );

    // @public (read-only) {Property.<Bounds2>} - the Bounds of the MomentaDiagram, in kg*(m/s). Derived from the zoom
    //                                            factor. This is inside the model to make the spacing between
    //                                            MomentaDiagramVectors visually uniform for 1D screens. See
    //                                            https://github.com/phetsims/collision-lab/issues/164.
    this.boundsProperty = new DerivedProperty( [ this.zoomProperty ], zoomFactor => {

      // The center of the MomentaDiagram is the origin.
      return new Bounds2(
        -MOMENTA_DIAGRAM_ASPECT_RATIO.width / 2 / zoomFactor,
        -MOMENTA_DIAGRAM_ASPECT_RATIO.height / 2 / zoomFactor,
        MOMENTA_DIAGRAM_ASPECT_RATIO.width / 2 / zoomFactor,
        MOMENTA_DIAGRAM_ASPECT_RATIO.height / 2 / zoomFactor
      );
    } );

    // @public {Property.<boolean>} - indicates if the MomentaDiagram is expanded. This is in the model since the positions
    //                             and components of the Momenta Vectors are only updated if this is true.
    this.expandedProperty = new BooleanProperty( false );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Map.<Ball, MomentaDiagramVector>} - Map prepopulatedBalls to an associated Momenta Vector.
    this.ballToMomentaVectorMap = new Map();

    // Populate the Map with MomentaDiagramVectors.
    prepopulatedBalls.forEach( ball => {
      this.ballToMomentaVectorMap.set( ball, new MomentaDiagramVector() );
    } );

    // @public (read-only) {MomentaDiagramVector} - the total sum of the Momenta Vectors of the system.
    this.totalMomentumVector = new MomentaDiagramVector();

    // @private {ObservableArrayDef.<Balls>} - reference to the Balls in the BallSystem.
    this.balls = balls;

    // @public {number} - reference to the passed-in dimension of the PlayArea.
    this.dimension = dimension;

    //----------------------------------------------------------------------------------------

    // Create a Multilink to update the positioning and components of the Momenta Vectors.
    //
    // For the dependencies, we use:
    //  - expandedProperty; for performance reasons, the MomentaDiagram isn't updated it isn't visible.
    //  - The momentum Properties of the prepopulatedBalls. Only the balls in the BallSystem are positioned and used in
    //    the total momentum calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total momentum.
    //  - this.zoomProperty, since changing the zoom changes the vertical spacing between vectors for 1D screens.
    //
    // This Multilink is never disposed and lasts for the lifetime of the sim.
    Multilink.multilink(
      [ this.expandedProperty, ...prepopulatedBalls.map( ball => ball.momentumProperty ), balls.lengthProperty, this.zoomProperty ],
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
    this.zoomProperty.reset();
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
      this.ballToMomentaVectorMap.get( ball ).componentsProperty.value = ball.momentumProperty.value;
    } );

    // Compute the components of the total Momenta Vector.
    const totalMomentum = Vector2.ZERO.copy();

    // Loop through and calculate the total momentum of the Balls in the BallSystem.
    this.balls.forEach( ball => { totalMomentum.add( ball.momentumProperty.value ); } );
    this.totalMomentumVector.componentsProperty.value = totalMomentum;

    //----------------------------------------------------------------------------------------

    // Reference the Momenta Vector associated with the first Ball in the system.
    const firstMomentaVector = this.ballToMomentaVectorMap.get( this.balls[ 0 ] );

    // Calculate the vertical spacing between the vectors for 1D screens, which is dependent on the zoom-level.
    const verticalSpacing = DEFAULT_1D_VERTICAL_SPACING / this.zoomProperty.value * MOMENTA_DIAGRAM_ZOOM_RANGE.defaultValue;

    // Position the first Momenta Vector and the total Momenta Vector in the correct position.
    if ( this.dimension === PlayArea.Dimension.TWO ) {

      // Set the first Momenta Vector's tail and the total Momenta Vector's tail at the origin.
      firstMomentaVector.tailPositionProperty.value = this.boundsProperty.value.center;
      this.totalMomentumVector.tailPositionProperty.value = this.boundsProperty.value.center;
    }
    else {

      // Set the first Momenta Vector's tail and the total Momenta Vector's tail at x = 0.
      firstMomentaVector.tailPositionProperty.value = new Vector2( 0, firstMomentaVector.tailPositionProperty.value.y );
      this.totalMomentumVector.tailPositionProperty.value = new Vector2( 0, this.totalMomentumVector.tailPositionProperty.value.y );

      // Set the y-value of the first Momenta Vector's tail and the total Momenta Vector's tail which depends on the
      // number of balls in the system.
      firstMomentaVector.tailPositionProperty.value = new Vector2( firstMomentaVector.tailPositionProperty.value.x, verticalSpacing * ( this.balls.length / 2 + 0.9 ) );
      this.totalMomentumVector.tailPositionProperty.value = new Vector2( this.totalMomentumVector.tailPositionProperty.value.x, firstMomentaVector.tailPositionProperty.value.y - this.balls.length * verticalSpacing );
    }

    // Position the rest of the Momentum vectors. Loop in pairs.
    CollisionLabUtils.forEachAdjacentPair( this.balls, ( ball, previousBall ) => {
      const momentaVector = this.ballToMomentaVectorMap.get( ball );
      const previousMomentaVector = this.ballToMomentaVectorMap.get( previousBall );

      if ( this.dimension === PlayArea.Dimension.TWO ) {

        // tip-to-tail
        momentaVector.tailPositionProperty.value = previousMomentaVector.tipPositionProperty.value;
      }
      else {

        // tipX-to-tailX
        momentaVector.tailPositionProperty.value = new Vector2( previousMomentaVector.tipPositionProperty.value.x, momentaVector.tailPositionProperty.value.y );

        // Stack vertically on top of each other by progressively decrementing the tipY.
        momentaVector.tailPositionProperty.value = new Vector2( momentaVector.tailPositionProperty.value.x, previousMomentaVector.tailPositionProperty.value.y - verticalSpacing );
      }
    } );
  }

  /**
   * Zooms the MomentaDiagram in. Called when the zoom-in button is pressed.
   * @public
   */
  zoomIn() {
    this.zoomProperty.value *= ZOOM_MULTIPLIER;
  }

  /**
   * Zooms the MomentaDiagram out. Called when the zoom-out button is pressed.
   * @public
   */
  zoomOut() {
    this.zoomProperty.value /= ZOOM_MULTIPLIER;
  }
}

collisionLab.register( 'MomentaDiagram', MomentaDiagram );
export default MomentaDiagram;