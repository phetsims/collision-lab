// Copyright 2020, University of Colorado Boulder

/**
 * The Model representation for the 'Momenta Diagram' accordion box, which appears at the bottom right of each screen.
 * Features the momentum Vectors of each Ball in the PlayArea, along with a total momentum vector, in a completely
 * separate coordinate frame from the PlayArea.
 *
 * Responsibilities are:
 *   - Keeping track of the zoom and Bounds of the MomentaDiagram, which changes in the view.
 *   - Create a MomentaDiagramVector for all possible Balls and one for the total Momentum Vector.
 *   - Update the tail positions and components of the Momentum Vectors when necessary. The positioning of the Vectors
 *     differ depending on the dimensions of the screen.
 *
 * MomentaDiagrams are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isArray from '../../../../phet-core/js/isArray.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';
import MomentaDiagramVector from './MomentaDiagramVector.js';

// constants
const MOMENTA_DIAGRAM_ZOOM_RANGE = CollisionLabConstants.MOMENTA_DIAGRAM_ZOOM_RANGE;
const MOMENTA_DIAGRAM_ASPECT_RATIO = CollisionLabConstants.MOMENTA_DIAGRAM_ASPECT_RATIO;
const ZOOM_MULTIPLIER = 2;

class MomentaDiagram {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of ALL possible balls.
   * @param {ObservableArray.<Ball>} balls - the Balls that are in the PlayArea system. All Balls must be apart of the
   *                                         prepopulatedBalls array.
   * @param {number} dimensions - the dimensions of the Screen that contains the MomentaDiagram. Positioning of the
   *                              Vectors are different depending on the dimensions.
   */
  constructor( prepopulatedBalls, balls, dimensions ) {
    assert && assert( isArray( prepopulatedBalls ) && _.every( prepopulatedBalls, ball => ball instanceof Ball ), `invalid prepopulatedBalls: ${ prepopulatedBalls }` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( dimensions === 1 || dimensions === 2, `invalid dimensions: ${ dimensions }` );

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - the zoom factor of the MomentaDiagram. This is set externally in the view.
    this.zoomProperty = new NumberProperty( MOMENTA_DIAGRAM_ZOOM_RANGE.defaultValue, {
      range: MOMENTA_DIAGRAM_ZOOM_RANGE
    } );

    // @public {DerivedProperty.<Bounds2>} - the Bounds of the MomentaDiagram, in meters. Derived from the zoom factor.
    this.boundsProperty = new DerivedProperty( [ this.zoomProperty ], zoomFactor => {

      // The center of the MomentaDiagram is the origin.
      return new Bounds2(
        -MOMENTA_DIAGRAM_ASPECT_RATIO.width / 2 / zoomFactor,
        -MOMENTA_DIAGRAM_ASPECT_RATIO.height / 2 / zoomFactor,
        MOMENTA_DIAGRAM_ASPECT_RATIO.width / 2 / zoomFactor,
        MOMENTA_DIAGRAM_ASPECT_RATIO.height / 2 / zoomFactor
      );
    } );

    //----------------------------------------------------------------------------------------

    // @public {BooleanProperty} - indicates if the MomentaDiagram is expanded. This is in the model since the positions
    //                             and components of the MomentaDiagram are only updated if this is true.
    this.expandedProperty = new BooleanProperty( false );

    // @public (read-only) {Map.<Ball, MomentaDiagramVector>} - Map prepopulatedBall to its associated Momenta Vector.
    this.ballToMomentaVectorMap = new Map();

    // Populate the Map with MomentaDiagramVectors.
    prepopulatedBalls.forEach( ball => {
      this.ballToMomentaVectorMap.set( ball, new MomentaDiagramVector() );
    } );

    // @public (read-only) {MomentaDiagramSumVector} - the total sum of the Momentum Vectors of the system.
    this.totalMomentumVector = new MomentaDiagramVector();

    // @private {ObservableArray.<Balls>} - reference to the Balls in the PlayArea system.
    this.balls = balls;

    // @private {number} - reference to the passed-in dimensions of the Screen that the MomentaDiagram appears in.
    this.dimensions = dimensions;

    //----------------------------------------------------------------------------------------

    // Create a Multilink to update our positioning and components of our Vectors.
    //
    // For the dependencies, we use:
    //  - expandedProperty; for performance reasons, the MomentaDiagram isn't updated it isn't visible.
    //  - The momentum Properties of the prepopulatedBalls. Only the balls in the play-area are positioned and used
    //    the total momenta calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total momenta.
    //
    // This Multilink is never disposed and lasts for the lifetime of the sim.
    Property.multilink(
      [ this.expandedProperty, ...prepopulatedBalls.map( ball => ball.momentumProperty ), balls.lengthProperty ],
      expanded => {
        expanded && this.updateVectors(); // Only update if the MomentaDiagram is visible (expanded).
      }
    );

    // One-time call to update the MomentaDiagramVectors for the fist time.
    this.updateVectors();
  }

  /**
   * Resets the MomentaDiagram. Called when the reset-all button is pressed.
   * @public.
   */
  reset() {
    this.zoomProperty.reset();
    this.expandedProperty.reset();
    this.updateVectors();
  }

  /**
   * Updates the components and positions of the momentum Vectors to match the Balls in the PlayArea. Only the Balls in
   * the PlayArea are updated and used to calculate the totalMomentum.
   * @private
   *
   * The positioning of the momentum Vectors are different for each dimension:
   *   For 2D Screens:
   *     - The first momentum Vector is placed at the origin.
   *     - Momentum vectors are placed tip-to-tail
   *     - The total momentum Vector is placed at the tail of the first vector.
   *   For 1D screens:
   *     - The momentum vectors are stacked vertically on top of each other, with the first vector on top and
   *       where the tailY coordinates of the other vectors are one-off of each other.
   *     - The first momentum Vector and the total momentum Vector's tailX are placed at x = 0. The vectors are then
   *       placed tipX-to-tailX.
   */
  updateVectors() {

    // First update the components of the Vectors.
    this.balls.forEach( ball => {
      this.ballToMomentaVectorMap.get( ball ).components = ball.momentum;
    } );

    // Update the components of the total momenta Vector.
    const totalMomentum = Vector2.ZERO.copy();

    // Loop through and calculate the total momentum of the Balls in the PlayArea system.
    this.balls.forEach( ball => { totalMomentum.add( ball.momentum ); } );
    this.totalMomentumVector.components = totalMomentum;

    //----------------------------------------------------------------------------------------

    // Reference the Momenta Vector of the first Ball in the system.
    const firstMomentaVector = this.ballToMomentaVectorMap.get( this.balls.get( 0 ) );

    // Position the momentum Vectors in the correct position, which depends on the dimensions.
    if ( this.dimensions === 2 ) {

      // Set the first momenta Vector's tail and the total momenta Vectors' tail at the origin.
      firstMomentaVector.tail = Vector2.ZERO;
      this.totalMomentumVector.tail = Vector2.ZERO;

      // Position the Momentum vectors tip-to-tail. Loop in pairs.
      for ( let i = 1; i < this.balls.length; i++ ) {
        const momentaVector = this.ballToMomentaVectorMap.get( this.balls.get( i ) );
        const previousMomentaVector = this.ballToMomentaVectorMap.get( this.balls.get( i - 1 ) );

        // tip-to-tail
        momentaVector.tail = previousMomentaVector.tip;
      }
    }
    else {

      // Set the first momenta Vector's tail and the total momenta Vectors' tail at x = 0.
      firstMomentaVector.tailX = 0;
      this.totalMomentumVector.tailX = 0;

      // Set the y-value of the first momenta Vector's tail and the total momenta Vector's tail which depends on the
      // number of balls in the system.
      firstMomentaVector.tailY = Math.floor( this.balls.length / 2 );
      this.totalMomentumVector.tailY = firstMomentaVector.tailY - this.balls.length;

      // Position the Momentum vectors tipX-to-tailX and stacked vertically on top of each other. Loop in pairs.
      for ( let i = 1; i < this.balls.length; i++ ) {
        const momentaVector = this.ballToMomentaVectorMap.get( this.balls.get( i ) );
        const previousMomentaVector = this.ballToMomentaVectorMap.get( this.balls.get( i - 1 ) );

        // tipX-to-tailX
        momentaVector.tailX = previousMomentaVector.tipX;

        // Stack vertically on top of each other by progressively decrementing the tipY by 1.
        momentaVector.tailY = previousMomentaVector.tailY - 1;
      }
    }
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