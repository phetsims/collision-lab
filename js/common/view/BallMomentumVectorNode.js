// Copyright 2019, University of Colorado Boulder

/**
 * View for the Momentum Vector of Ball
 *
 * Responsible for:
 *  - Keeping the tail of the ArrowNode at the center of the Ball
 *  - Creating an API to update the direction and magnitude of the ArrowNode
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const BallVectorNode = require( 'COLLISION_LAB/common/view/BallVectorNode' );

  class BallMomentumVectorNode extends BallVectorNode {

    /**
     * @param {Property.<Vector2>} vectorProperty
     * @param {BooleanProperty} visibleProperty - Property that indicates if this node is visible
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( vectorProperty, visibleProperty, modelViewTransform, options ) {

      assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2,
        `invalid modelViewTransform: ${modelViewTransform}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      //----------------------------------------------------------------------------------------

      options = merge( {

        arrowOptions: {} // TODO
      }, options );

      super( vectorProperty, visibleProperty, modelViewTransform, options );

    }

  }

  return collisionLab.register( 'BallMomentumVectorNode', BallMomentumVectorNode );
} );