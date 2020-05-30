// Copyright 2020, University of Colorado Boulder

/**
 * The Model representation for the 'Momenta Diagram' accordion box, which appears at the bottom right of each screen.
 * Features the momentum Vectors of each Ball in the PlayArea, along with a total momentum vector, in a completely
 * separate coordinate frame from the PlayArea. The positioning of the Vectors differ for each screen, so this is meant
 * to be subclassed.
 *
 * Responsibilities are:
 *   - Keeping track of the zoom and Bounds of the MomentaDiagram, which changes in the view.
 *   - Create a MomentaDiagramVector for all possible Balls and one for the total Momentum Vector.
 *   - Update the tail positions and components of the Momentum Vectors when necessary.
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

// @abstract
class MomentaDiagram {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of ALL possible balls.
   * @param {ObservableArray.<Ball>} balls - the Balls that are in the PlayArea system. All Balls must be apart of the
   *                                         prepopulatedBalls array.
   */
  constructor( prepopulatedBalls, balls ) {
    assert && assert( isArray( prepopulatedBalls ), `invalid prepopulatedBalls: ${ prepopulatedBalls }` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

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

    // @public (read-only) {BooleanProperty} - indicates if the MomentaDiagram is expanded. This is in the model since
    //                                         the positions and components of the MomentaDiagram are only updated if
    //                                         this is true.
    this.expandedProperty = new BooleanProperty( false );

    // @public (read-only) {Map.<Ball, MomentaDiagramVector>} - Map prepopulatedBall to its associated Momenta Vector.
    this.ballToMomentaVectorMap = new Map();

    // Populate the Map with MomentaDiagramVectors.
    prepopulatedBalls.forEach( ball => {
      this.ballToMomentaVectorMap.set( ball, new MomentaDiagramVector() );
    } );

    // @public (read-only) {MomentaDiagramSumVector} - the sum of the Momentum Vectors of the system.
    this.sumVector = new MomentaDiagramVector();

    // @protected {ObservableArray.<Balls>} - reference to the Balls in the PlayArea system.
    this.balls = balls;

    //----------------------------------------------------------------------------------------

    // Create a Multilink to update our positioning and components of our Vectors.
    //
    // For the dependencies, we use:
    //  - expandedProperty; for performance reasons, the MomentaDiagram isn't updated it isn't visible.
    //  - The momentum Properties of the prepopulatedBalls. Only the balls in the play-area are positioned and used
    //    the sum calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the sum.
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
   * Updates the tail and components of the Vectors to match the Balls in the PlayArea. Only the Balls in the PlayArea
   * are updated.
   * @private
   *
   * Since positioning of Vectors differs for different screens, this method will invoke a abstract method
   * for the positioning of the Vectors.
   */
  updateVectors() {

    // First update the components of the Vectors.
    this.balls.forEach( ball => {
      this.ballToMomentaVectorMap.get( ball ).components = ball.momentum;
    } );

    // Update the components of the sum.
    const totalMomentum = Vector2.ZERO.copy();

    // Loop through and calculate the total momentum of the Balls in the PlayArea system.
    this.balls.forEach( ball => { totalMomentum.add( ball.momentum ); } );
    this.sumVector.components = totalMomentum;

    // Call the positionVectors() abstract method to update the tail positions of the Vectors.
    this.positionVectors();
  }

  /**
   * Positions the Momenta Vectors accordingly. This behavior is different for each screen. For instance, in
   * 'Explore 2D', the Vectors are placed tip-to-tail, while in `Explore 1D`, the Vectors are stacked on top of
   * each other.
   *
   * @abstract
   * @protected
   */
  positionVectors() {
    // TODO: For now, I'm going to implement the explore 2D behavior, in the future this should be removed.

    const firstBall = this.balls.get( 0 );
    const firstVector = this.ballToMomentaVectorMap.get( firstBall );

    // Set the first Vector's tail at the origin.
    firstVector.tail = Vector2.ZERO;
    this.sumVector.tail = firstVector.tail;

    for ( let i = 1; i < this.balls.length; i++ ) {

      const vector = this.ballToMomentaVectorMap.get( this.balls.get( i ) );
      const previousVector = this.ballToMomentaVectorMap.get( this.balls.get( i - 1 ) );

      vector.tail = previousVector.tip;
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