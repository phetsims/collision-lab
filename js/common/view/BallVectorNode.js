// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallVectorNode is the root class (to be subclassed) view representation of a Ball's vector, used for the Ball's
 * velocity and momentum vectors. They appear in all screens of the 'Collision Lab' simulation and are positioned
 * on top of Balls.
 *
 * Responsible for:
 *  - Keeping the tail of the ArrowNode at the center of the Ball
 *  - Creating an API to update the direction and magnitude of the ArrowNode
 *
 * For the 'Collision Lab' sim, Balls are instantiated at the start of the sim are never disposed, even if they aren't
 * in the system. Thus, BallVectorNode subtypes persist for the lifetime of the simulation and links are left as-is.
 * See BallNode.js for more background.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
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

    visibleProperty.linkAttribute( this, 'visible' );
  }
}

collisionLab.register( 'BallVectorNode', BallVectorNode );
export default BallVectorNode;