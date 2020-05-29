// Copyright 2020, University of Colorado Boulder

/**
 * A model for the sum Vector that appears in the 'Momenta Diagram' accordion box. It's magnitude represents the total
 * sum of all momentumProperties of the Balls in the PlayArea system.
 *
 * MomentaDiagramSumVector's tails are positioned in MomentaDiagram.js and are never disposed.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isArray from '../../../../phet-core/js/isArray.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import MomentaDiagramBaseVector from './MomentaDiagramBaseVector.js';

class MomentaDiagramSumVector extends MomentaDiagramBaseVector {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArray.<Ball>} balls - the Balls that are in the PlayArea system.
   * @param {Property.<boolean>} momentaDiagramExpandedProperty - indicates if the Momenta Diagram is expanded and
   *                                                              visible. This is needed for performance; the
   *                                                              total momentum is only updated if this is true.
   */
  constructor( prepopulatedBalls, balls, momentaDiagramExpandedProperty ) {
    assert && assert( isArray( prepopulatedBalls ), `invalid prepopulatedBalls: ${ prepopulatedBalls }` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( momentaDiagramExpandedProperty instanceof Property && typeof momentaDiagramExpandedProperty.value === 'boolean', `invalid momentaDiagramExpandedProperty: ${momentaDiagramExpandedProperty}` );

    // Gather the momentum Property of ALL possible balls.
    const ballMomentumProperties = prepopulatedBalls.map( ball => ball.momentumProperty );


    // Create the Property whose value is components of the Vector, which is the total momentum of the system of balls.
    //
    // For the dependencies, we use:
    //  - momentaDiagramExpandedProperty; for performance reasons, the components aren't updated if it isn't visible.
    //  - The momentum Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total momentum of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    const totalMomentumProperty = new DerivedProperty(
      [ momentaDiagramExpandedProperty, ...ballMomentumProperties, balls.lengthProperty ],
      momentaDiagramExpanded => {

        // Loop through and calculate the total momentum of the Balls in the PlayArea system.
        const totalMomentum  = new Vector2( 0, 0 );
        balls.forEach( ball => { totalMomentum.add( ball.momentum ); } );

        return totalMomentum;
      }, {
        valueType: Vector2
    } );

    super( totalMomentumProperty );
  }
}

collisionLab.register( 'MomentaDiagramSumVector', MomentaDiagramSumVector );
export default MomentaDiagramSumVector;