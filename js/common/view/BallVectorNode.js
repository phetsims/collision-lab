// Copyright 2019, University of Colorado Boulder

/**
 * View for the vectors of Balls. See https://github.com/phetsims/collision-lab/issues/24 for
 * an overview of the BallVector view hierarchy.
 *
 * Responsible for:
 *  - Keeping the tail of the ArrowNode at the center of the Ball
 *  - Creating an API to update the direction and magnitude of the ArrowNode
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );

  class BallVectorNode extends Node {

    /**
     * @param {Ball} ball
     * @param {ModelViewTransform2} modelViewTransform
     * @param {BooleanProperty} visibleProperty - Property that indicates if this node is visible
     * @param {Object} [options]
     */
    constructor( ball, modelViewTransform, visibleProperty, options ) {

      assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2,
        `invalid modelViewTransform: ${modelViewTransform}` );
      assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      //----------------------------------------------------------------------------------------

      options = merge( {

        arrowOptions: {} // TODO
      }, options );

      super();

    }

  }

  return collisionLab.register( 'BallVectorNode', BallVectorNode );
} );