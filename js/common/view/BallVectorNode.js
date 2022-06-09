// Copyright 2019-2022, University of Colorado Boulder

/**
 * BallVectorNode is the root class (to be subclassed) view representation of a single Ball's vector, used for the
 * Ball's velocity and momentum vectors. They appear in all screens of the 'Collision Lab' simulation and are positioned
 * on top of Balls.
 *
 * Responsible for:
 *  - Translating this Node to the center of the Ball. The origin of this Node is the tail of the vector.
 *  - Updating the tip of the Vector based on a ballValueProperty.
 *
 * For the 'Collision Lab' sim, Balls are instantiated at the start of the sim are never disposed, even if they aren't
 * in the system. Thus, BallVectorNode subtypes persist for the lifetime of the simulation and links are left as-is.
 * See BallNode.js for more background.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class BallVectorNode extends Node {

  /**
   * @param {Property.<Vector2>} ballPositionProperty - the position of the Ball, in meters.
   * @param {ReadOnlyProperty.<Vector2>} ballValueProperty - either the momentum or velocity Ball-value Property. Regardless,
   *                                                 its value represents the components of the BallVectorNode.
   * @param {Property.<boolean>} visibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ballPositionProperty, ballValueProperty, visibleProperty, modelViewTransform, options ) {
    assert && AssertUtils.assertPropertyOf( ballPositionProperty, Vector2 );
    assert && AssertUtils.assertAbstractPropertyOf( ballValueProperty, Vector2 );
    assert && AssertUtils.assertPropertyOf( visibleProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge( {}, CollisionLabConstants.ARROW_OPTIONS )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode( 0, 0, 0, 0, options.arrowOptions );

    // Observe when the Ball's position change and update the translation of this Node. The origin of this Node
    // is the tail of the vector. Link is never unlinked since BallVectorNodes are never disposed.
    ballPositionProperty.link( ballPosition => {
      this.translation = modelViewTransform.modelToViewPosition( ballPosition );
    } );

    // Observe when the ballValueProperty changes and update the tip position of this Node. Link is never unlinked since
    // BallVectorNodes are never disposed.
    ballValueProperty.link( ballValue => {

      // Get the position of the tip in view coordinates. This is relative to our origin, which is the tail of the
      // Vector.
      const tipViewPosition = modelViewTransform.modelToViewDelta( ballValue );

      // Only display the Vector if it has a magnitude that isn't effectively 0.
      if ( tipViewPosition.magnitude > CollisionLabConstants.ZERO_THRESHOLD ) {
        arrowNode.setTip( tipViewPosition.x, tipViewPosition.y );
      }
      else {
        arrowNode.setTip( 0, 0 );
      }
    } );

    //----------------------------------------------------------------------------------------

    // Observe when the visibleProperty change and update the visibility of this Node. Link is never unlinked since
    // BallVectorNodes are never disposed.
    visibleProperty.linkAttribute( this, 'visible' );

    // Finally, add the arrow as a child of this Node.
    this.addChild( arrowNode );
  }
}

collisionLab.register( 'BallVectorNode', BallVectorNode );
export default BallVectorNode;