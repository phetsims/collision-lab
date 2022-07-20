// Copyright 2020-2022, University of Colorado Boulder

/**
 * A view that renders a 'Change in Momentum' vector for a Ball in the 'Intro' screen, using the IntroBallSystem's
 * corresponding changeInMomentumProperty. ChangeInMomentumVectorNodes are created for each Ball, meaning they are
 * created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * The opacity and magnitude of the 'Change in Momentum' vectors are modeled in IntroBallSystem, so all this view has to
 * do is mirror the opacity and components that are modeled. However, the tail-x position of the change in momentum
 * vectors must match the x-position of the Ball, and the vector is at a constant y-position above the
 * Ball.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../../common/CollisionLabColors.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';

class ChangeInMomentumVectorNode extends Node {

  /**
   * @param {Property.<Vector2>} changeInMomentumProperty - the components of the 'Change in Momentum' vector.
   * @param {Property.<number>} opacityProperty - opacity of the 'Change in Momentum' vector.
   * @param {Property.<Vector2>} ballPositionProperty - the position of the corresponding Ball, in meters.
   * @param {Bounds2} playAreaBounds - bounds of the PlayArea, in meters.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( changeInMomentumProperty,
               opacityProperty,
               ballPositionProperty,
               playAreaBounds,
               modelViewTransform,
               options ) {
    assert && AssertUtils.assertPropertyOf( changeInMomentumProperty, Vector2 );
    assert && AssertUtils.assertPropertyOf( opacityProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( ballPositionProperty, Vector2 );
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge( {
        fill: CollisionLabColors.MOMENTUM_VECTOR_FILL,
        stroke: CollisionLabColors.MOMENTUM_VECTOR_STROKE
      }, CollisionLabConstants.ARROW_OPTIONS ),

      // {number[]} - line-dash pattern for the line that connects the Vector to the center of the Ball.
      connectingLineDash: [ 5, 4 ]

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode( 0, 0, 0, 0, options.arrowOptions );

    // Create the dashed Line that connects the tail of the Vector to the center of the Ball.
    const connectingLine = new Line( {
      lineDash: options.connectingLineDash,
      stroke: CollisionLabColors.CHANGE_IN_MOMENTUM_DASHED_LINE
    } );

    // Get the Bounds of the PlayArea in view coordinates.
    const playAreaViewBounds = modelViewTransform.modelToViewBounds( playAreaBounds );

    // Set the children of this Node in the correct rendering order.
    this.children = [
      arrowNode,
      connectingLine
    ];

    //----------------------------------------------------------------------------------------

    // Observe when either the position of the Ball changes or when the components of the Change in Momentum vector
    // changes and update the arrow and the connecting line. This Multilink is never disposed since
    // ChangeInMomentumVectorNodes and Balls are never disposed.
    Multilink.multilink( [ ballPositionProperty, changeInMomentumProperty ], ( ballPosition, changeInMomentum ) => {

      // Get the position of the Ball in view coordinates.
      const ballViewPosition = modelViewTransform.modelToViewPosition( ballPosition );

      // Set the visibility of this Node to true if the Ball's center is inside the PlayArea and false otherwise.
      this.visible = playAreaViewBounds.containsPoint( ballViewPosition )
                     && changeInMomentum.magnitude > CollisionLabConstants.ZERO_THRESHOLD;

      // Update the positioning of the arrow and the connecting line if this Node is visible.
      if ( this.visible ) {

        // Calculate the position of the Change in Momentum vector in view coordinates.
        const tailViewPosition = ballViewPosition.minusXY( 0, ChangeInMomentumVectorNode.CHANGE_IN_MOMENTUM_Y_OFFSET );
        const tipViewPosition = tailViewPosition.plus( modelViewTransform.modelToViewDelta( changeInMomentum ) );

        // Update the positioning of the ArrowNode.
        arrowNode.setTailAndTip( tailViewPosition.x, tailViewPosition.y, tipViewPosition.x, tipViewPosition.y );

        // Update the positioning of the connecting line.
        connectingLine.setLine( ballViewPosition.x, ballViewPosition.y, tailViewPosition.x, tailViewPosition.y );
      }
    } );

    // Observe when the opacityProperty changes and match the opacity of this Node. Link is never unlinked
    // since ChangeInMomentumVectorNodes are never disposed.
    opacityProperty.linkAttribute( this, 'opacity' );
  }
}

// @public (read-only) {number} - vertical offset between the Ball's center and the Vectors.
ChangeInMomentumVectorNode.CHANGE_IN_MOMENTUM_Y_OFFSET = 120;

collisionLab.register( 'ChangeInMomentumVectorNode', ChangeInMomentumVectorNode );
export default ChangeInMomentumVectorNode;