// Copyright 2020, University of Colorado Boulder

/**
 * The Model representation for the 'Momenta Diagram' accordion box at the bottom right of each screen.
 *
 * Responsibilities are:
 *   - create a MomentaDiagramVector for each prepopulated Ball.
 *   - create a MomentaDiagramSumVector.
 *   - update the tail positions of the Vectors when necessary.
 *
 * MomentaDiagrams are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isArray from '../../../../phet-core/js/isArray.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import MomentaDiagramVector from './MomentaDiagramVector.js';

class MomentaDiagram {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls.
   * @param {ObservableArray.<Ball>} balls - the Balls that are in the PlayArea system.
   */
  constructor( prepopulatedBalls, balls ) {
    assert && assert( isArray( prepopulatedBalls ), `invalid prepopulatedBalls: ${ prepopulatedBalls }` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {BooleanProperty} - indicates if the MomentaDiagram is expanded. This is in the model since
    //                                         the positions and components of the MomentaDiagram are only updated if
    //                                         this is true and are cleared when set to false.
    this.expandedProperty = new BooleanProperty( false );

    // @public {Map.<Ball, MomentaDiagramVector>}
    this.ballToVectorMap = new Map();

    balls.forEach( ball => {
      this.ballToVectorMap.set( ball, new MomentaDiagramVector()  );
    } );

    this.balls = balls;

    // @public {MomentaDiagramSumVector} - the Vector that represents the sum of the Momentum Vectors of the system. To be updated later.
    this.sumVector = new MomentaDiagramVector();

    //----------------------------------------------------------------------------------------

    // Observe when the momentum Properties of any of the prepopulatedBalls changes to update the MomentaDiagram
    // orientation and positioning of Vectors. Also observe when the expandedProperty changes, for performance.
    Property.multilink( [ this.expandedProperty, ...prepopulatedBalls.map( ball => ball.momentumProperty ) ],
     expanded => {
      if ( expanded ) {
        this.updateVectors();
      }
     } );
  }

  updateVectors() {
    const firstBall = this.balls.get( 0 );
    const firstVector = this.ballToVectorMap.get( firstBall );

    // Set the first Vector's tail at the origin.
    firstVector.tail = Vector2.ZERO;
    firstVector.components = firstBall.momentum;

    for ( let i = 0; i < this.balls.length; i++ ) {
      const ball =  this.balls.get( i );

      const vector = this.ballToVectorMap.get( ball );
      const previousVector = this.ballToVectorMap.get( this.balls.get( i - 1 ) );

      vector.tail = previousVector.tip;
      vector.components = ball.momentum;
    }

    this.sumVector.tail = firstVector.tail;
    this.sumVector.components = this.calculateTotalMomentum();
  }

  calculateTotalMomentum() {
    // Loop through and calculate the total momentum of the Balls in the PlayArea system.
    const totalMomentum  = new Vector2( 0, 0 );
    this.balls.forEach( ball => { totalMomentum.add( ball.momentum ); } );

    return totalMomentum;
  }
}

collisionLab.register( 'MomentaDiagram', MomentaDiagram );
export default MomentaDiagram;