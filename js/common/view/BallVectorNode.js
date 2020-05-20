// Copyright 2019-2020, University of Colorado Boulder

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

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// const Vector2 = require( '/dot/js/Vector2' );

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
      if ( vector.magnitude > CollisionLabConstants.ZERO_THRESHOLD ) {
        const viewVector = modelViewTransform.modelToViewDelta( vector );
        this.arrowNode.setTip( viewVector.x, viewVector.y );
      }
      else {
        this.arrowNode.setTip( 0, 0 );
      }
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

collisionLab.register( 'BallVectorNode', BallVectorNode );
export default BallVectorNode;