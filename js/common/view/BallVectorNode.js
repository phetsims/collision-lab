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
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );

  // const Vector2 = require( 'DOT/Vector2' );

  class BallVectorNode extends Node {

    /**
     * @param {Property.<Vector2>} tipPositionProperty
     * @param {Property.<boolean>} visibleProperty - Property that indicates if this node is visible
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( tipPositionProperty, visibleProperty, modelViewTransform, options ) {

      assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2,
        `invalid modelViewTransform: ${modelViewTransform}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      //----------------------------------------------------------------------------------------
      options = merge( {

        arrowOptions: {} // TODO
      }, options );

      const viewVector = modelViewTransform.modelToViewDelta( tipPositionProperty.value );

      super();

      // @public
      this.arrowNode = new ArrowNode( 0, 0, viewVector.x, viewVector.y, options );
      this.addChild( this.arrowNode );

      const tipPositionListener = vector => {
        const viewVector = modelViewTransform.modelToViewDelta( vector );
        this.arrowNode.setTip( viewVector.x, viewVector.y );
        this.arrowNode.visible = visibleProperty.value;
      };

      tipPositionProperty.link( tipPositionListener );

      const visiblePropertyHandle = visibleProperty.linkAttribute( this, 'visible' );

      // @private {function} disposeBallVectorNode - function to unlink listeners, called in dispose()
      this.disposeBallVectorNode = () => {
        visibleProperty.unlinkAttribute( visiblePropertyHandle );
        tipPositionProperty.unlink( tipPositionListener );
      };

    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeBallVectorNode();
      super.dispose();
    }
  }

  return collisionLab.register( 'BallVectorNode', BallVectorNode );
} );