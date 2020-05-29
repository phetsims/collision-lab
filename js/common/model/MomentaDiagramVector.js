// Copyright 2020, University of Colorado Boulder

/**
 * A model for a single Vector that appears in the 'Momenta Diagram' accordion box. A single MomentaDiagramVector
 * correlates to a single prepopulatedBalls Ball, which may or may not be in the PlayArea system.
 *
 * Extends MomentaDiagramBaseVector but it also keeps track of a whether or not its correlated Ball is currently in the
 * PlayArea system.
 *
 * MomentaDiagramVector's tails are positioned in MomentaDiagram.js. Since MomentaDiagramVectors correlate to a
 * prepopulatedBalls, which are never disposed, MomentaDiagramVectors are also never disposed.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import MomentaDiagramBaseVector from './MomentaDiagramBaseVector.js';

class MomentaDiagramVector extends MomentaDiagramBaseVector {

  /**
   * @param {Ball} ball - the Ball whose momentum is modeled. May or may not be in the PlayArea system.
   * @param {ObservableArray.<Ball>} balls - the Balls that are in the PlayArea system.
   */
  constructor( ball, balls ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    //----------------------------------------------------------------------------------------

    super( ball.momentumProperty );

    // @public (read-only) {DerivedProperty.<boolean>} - indicates if the correlated Ball (and thus, the Vector itself)
    //                                                   is in the PlayArea system. Never disposed since
    //                                                   MomentaDiagramVectors are never disposed.
    this.isInPlayAreaProperty = new DerivedProperty( [ balls.lengthProperty ], () => balls.contains( ball ), {
      valueType: 'boolean'
    } );
  }
}

collisionLab.register( 'MomentaDiagramVector', MomentaDiagramVector );
export default MomentaDiagramVector;